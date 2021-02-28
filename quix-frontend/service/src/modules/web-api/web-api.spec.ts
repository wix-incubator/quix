/* tslint:disable:no-non-null-assertion */

import {Test, TestingModule} from '@nestjs/testing';
import {
  getConnectionToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import uuid from 'uuid/v4';
import {FileType} from '@wix/quix-shared';
import {ConfigService, ConfigModule} from '../../config';
import {range} from 'lodash';

import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  NoteRepository,
  FileTreeRepository,
  DbUser,
  DbFavorites,
} from '../../entities';
import {DbAction} from '../event-sourcing/infrastructure/action-store/entities/db-action.entity';
import {FoldersService} from './folders/folders.service';
import {NotebookService} from './notebooks/notebooks.service';
import {FavoritesService} from './favorites/favorites.service';
import {WebApiModule} from './web-api.module';
import {EntityType} from '../../common/entity-type.enum';
import {AuthModuleConfiguration} from '../auth/auth.module';
import {AuthTypes} from '../auth/types';

jest.setTimeout(60000);

function createNotebook(defaultUser: string, notebookName = 'New notebook') {
  const notebook = new DbNotebook();

  notebook.id = uuid();
  notebook.owner = defaultUser;
  notebook.name = notebookName;

  return notebook;
}

function createNotebookNode(defaultUser: string, notebookName: string) {
  const notebook = createNotebook(defaultUser, notebookName);

  const notebookNode = new DbFileTreeNode();
  notebookNode.id = uuid();
  notebookNode.owner = defaultUser;
  notebookNode.notebookId = notebook.id;
  notebookNode.type = FileType.notebook;
  return [notebookNode, notebook] as const;
}

function createNote(defaultUser: string, noteName: string, notebookId: string) {
  const note = new DbNote({
    id: uuid(),
    owner: defaultUser,
    name: noteName,
    textContent: '',
    jsonContent: undefined,
    type: 'presto',
    notebookId,
    dateCreated: 1,
    dateUpdated: 1,
    richContent: {},
  });
  return note;
}

function createFolderNode(defaultUser: string, folderName: string) {
  const folderNode = new DbFileTreeNode();
  folderNode.id = uuid();
  folderNode.owner = defaultUser;
  folderNode.folder = Object.assign(new DbFolder(), {
    id: folderNode.id,
    name: folderName,
    owner: defaultUser,
  });
  return folderNode;
}

function createFavorite(
  owner: string,
  entityId: string,
  entityType: EntityType,
) {
  return Object.assign(new DbFavorites(), {
    entityId,
    entityType,
    owner,
  });
}

// TODO: write a driver for this test, refactor everything @aviad
describe('web-api module', () => {
  let module: TestingModule;
  let noteRepo: NoteRepository;
  let notebookRepo: Repository<DbNotebook>;
  let folderRepo: Repository<DbFolder>;
  let eventsRepo: Repository<DbAction>;
  let fileTreeRepo: FileTreeRepository;
  let favoritesRepo: Repository<DbFavorites>;
  let userRepo: Repository<DbUser>;
  let folderService: FoldersService;
  let notebookService: NotebookService;
  let favoritesService: FavoritesService;
  let configService: ConfigService;
  let conn: Connection;
  const defaultUser = 'foo@wix.com';

  async function clearDb() {
    const dbType = configService.getDbType();
    await conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS=0'
        : 'PRAGMA foreign_keys = OFF',
    );
    await eventsRepo.delete({});
    await noteRepo.delete({});
    await folderRepo.delete({});
    await notebookRepo.delete({});
    await fileTreeRepo.clear();
    await favoritesRepo.clear();
    await userRepo.clear();
    await conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS=1'
        : 'PRAGMA foreign_keys = ON',
    );
  }
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AuthModuleConfiguration.create({
          type: AuthTypes.FAKE,
          cookieName: 'foo',
        }), // consider restructuring web-api module so it won't import auth. feels wrong needing to importing authModule here
        WebApiModule,
        ConfigModule.create(),
        TypeOrmModule.forRootAsync({
          imports: [],
          useFactory: async (cs: ConfigService) =>
            cs.getDbConnection([
              DbFileTreeNode,
              DbFolder,
              DbNote,
              DbNotebook,
              DbAction,
              DbUser,
              DbFavorites,
            ]),
          inject: [ConfigService],
        }),
      ],
      providers: [],
      exports: [],
    }).compile();

    notebookRepo = module.get(getRepositoryToken(DbNotebook));
    noteRepo = module.get(getRepositoryToken(NoteRepository));
    eventsRepo = module.get(getRepositoryToken(DbAction));
    fileTreeRepo = module.get(getRepositoryToken(FileTreeRepository));
    folderRepo = module.get(getRepositoryToken(DbFolder));
    favoritesRepo = module.get(getRepositoryToken(DbFavorites));
    userRepo = module.get(getRepositoryToken(DbUser));
    folderService = module.get(FoldersService);
    notebookService = module.get(NotebookService);
    favoritesService = module.get(FavoritesService);
    conn = module.get(getConnectionToken());
    configService = module.get(ConfigService);
  });

  beforeEach(async () => await clearDb());
  afterAll(() => module.close());

  describe('foldersService', () => {
    describe('getPathList', () => {
      it('get a path list with notebooks inside a folder', async () => {
        await userRepo.save({
          id: defaultUser,
          name: 'some name',
          avatar: 'http://url',
          rootFolder: 'someId',
        });

        const notebookName = 'some new notebook';
        const [notebookNode, notebook] = createNotebookNode(
          defaultUser,
          notebookName,
        );
        const folderNode = createFolderNode(defaultUser, 'folderName');
        await fileTreeRepo.save(folderNode);
        notebookNode.parent = folderNode;

        await notebookRepo.save(notebook);
        await fileTreeRepo.save(notebookNode);
        const list = await folderService.getFilesForUser(defaultUser);

        expect(list!.find(i => i.id === notebook.id)!).toMatchObject({
          id: notebook.id,
          name: notebookName,
          path: [{name: 'folderName'}],
        });
      });

      it('get a path list, multiple items in root', async () => {
        const notebookName = 'some new notebook';
        const [notebookNode, notebook] = createNotebookNode(
          defaultUser,
          notebookName,
        );
        const folderNode = createFolderNode(defaultUser, 'folderName');

        await fileTreeRepo.save(folderNode);
        await notebookRepo.save(notebook);
        await fileTreeRepo.save(notebookNode);

        const list = await folderService.getFilesForUser(defaultUser);
        expect(list).toHaveLength(2);
      });

      it('get a path list, starting from a specific folder', async () => {
        const notebookName = 'some new notebook';
        const [notebookNode, notebook] = createNotebookNode(
          defaultUser,
          notebookName,
        );
        const parentFolderNode = createFolderNode(defaultUser, 'folderName');
        const subFolderNode = createFolderNode(defaultUser, 'folderName2');
        const subsubFolderNode = createFolderNode(defaultUser, 'folderName3');

        subFolderNode.parent = parentFolderNode;
        subsubFolderNode.parent = subFolderNode;

        await fileTreeRepo.save(parentFolderNode);
        await fileTreeRepo.save(subFolderNode);
        await fileTreeRepo.save(subsubFolderNode);

        await notebookRepo.save(notebook);
        notebookNode.parent = subsubFolderNode;
        await fileTreeRepo.save(notebookNode);

        const folder = await folderService.getFolder(subFolderNode.id);
        const expected = {
          id: subFolderNode.id,
          name: 'folderName2',
          path: [
            {
              name: 'folderName',
              id: parentFolderNode.id,
            },
          ],
          dateCreated: expect.any(Number),
          dateUpdated: expect.any(Number),
          ownerDetails: {id: defaultUser},
          owner: defaultUser,
          type: FileType.folder,
          files: [
            {
              id: subsubFolderNode.id,
              dateCreated: expect.any(Number),
              dateUpdated: expect.any(Number),
              type: FileType.folder,
              name: 'folderName3',
              ownerDetails: {id: defaultUser},
              owner: defaultUser,
              path: [
                {
                  name: 'folderName',
                  id: parentFolderNode.id,
                },
                {
                  id: subFolderNode.id,
                  name: 'folderName2',
                },
              ],
            },
          ],
        };

        expect(folder).toMatchObject(expected);
      });
    });
  });

  describe('notebook service', () => {
    it('get a notebook, with valid path', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = createNotebookNode(
        defaultUser,
        notebookName,
      );
      const folderNode = createFolderNode(defaultUser, 'folderName');
      const folderNode2 = createFolderNode(defaultUser, 'folderName2');
      folderNode2.parent = folderNode;
      await fileTreeRepo.save(folderNode);
      await fileTreeRepo.save(folderNode2);
      notebookNode.parent = folderNode2;

      await notebookRepo.save(notebook);
      await fileTreeRepo.save(notebookNode);

      const response = await notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.path).toEqual([
        {name: 'folderName', id: folderNode.id},
        {name: 'folderName2', id: folderNode2.id},
      ]);
    });

    it('get a notebook, with notes sorted in order', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = createNotebookNode(
        defaultUser,
        notebookName,
      );

      await notebookRepo.save(notebook);
      await fileTreeRepo.save(notebookNode);

      const notes = range(5).map(i =>
        createNote(defaultUser, `note${i}`, notebook.id),
      );
      for (const note of notes) {
        await noteRepo.insertNewWithRank(note);
      }
      const from = 3;
      const to = 1;
      await noteRepo.reorder(notes[from], to);

      const response = await notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );
      expect(response!.notes[to].name).toBe(`note${from}`);
    });

    it('get a notebook, with favorite indication', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = createNotebookNode(
        defaultUser,
        notebookName,
      );
      const favorite = createFavorite(
        defaultUser,
        notebook.id,
        EntityType.Notebook,
      );

      await notebookRepo.save(notebook);
      await fileTreeRepo.save(notebookNode);
      await favoritesRepo.save(favorite);

      const response = await notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.isLiked).toBe(true);
    });

    it('get a notebook, with user details', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = createNotebookNode(
        defaultUser,
        notebookName,
      );

      await userRepo.save({
        id: defaultUser,
        name: 'some name',
        avatar: 'http://url',
        rootFolder: 'someId',
      });
      await notebookRepo.save(notebook);
      await fileTreeRepo.save(notebookNode);

      const response = await notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.ownerDetails).toMatchObject({
        id: defaultUser,
        name: 'some name',
        avatar: 'http://url',
      });
    });

    it('get a notebook, even when user does not exist', async () => {
      const notebookName = 'some new notebook';
      const [notebookNode, notebook] = createNotebookNode(
        defaultUser,
        notebookName,
      );

      await notebookRepo.save(notebook);
      await fileTreeRepo.save(notebookNode);

      const response = await notebookService.getNotebook(
        defaultUser,
        notebook.id,
      );

      expect(response!.id).toBe(notebook.id);
      expect(response!.ownerDetails).toMatchObject({
        id: defaultUser,
        name: '',
      });
    });
  });

  describe('favorites service', () => {
    it('get favorites per user', async () => {
      const secondUser = 'secondUser@foo.com';
      await userRepo.save({
        id: defaultUser,
        name: 'some name',
        avatar: 'http://url',
        rootFolder: 'someId',
      });
      await userRepo.save({
        id: secondUser,
        name: '2ndUser',
        avatar: 'http://url',
        rootFolder: 'someId2',
      });

      const notebook = createNotebook(defaultUser);
      const favorite = createFavorite(
        secondUser,
        notebook.id,
        EntityType.Notebook,
      );

      await notebookRepo.save(notebook);
      await favoritesRepo.save(favorite);

      const response = await favoritesService.getFavoritesForUser(secondUser);

      expect(response).toEqual([
        {
          id: notebook.id,
          name: notebook.name,
          type: FileType.notebook,
          owner: notebook.owner,
          ownerDetails: expect.objectContaining({
            id: defaultUser,
            name: 'some name',
          }),
          isLiked: true,
          path: [],
          dateCreated: notebook.dateCreated,
          dateUpdated: notebook.dateUpdated,
        },
      ]);
    });
  });
});
