import {Test, TestingModule} from '@nestjs/testing';
import {
  getConnectionToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import uuid from 'uuid/v4';
import {FileType} from '../../../../shared/entities/file';
import {ConfigModule} from '../../config/config.module';
import {ConfigService} from '../../config/config.service';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {FileTreeRepository} from '../../entities/filenode.repository';
import {MySqlAction} from '../event-sourcing/infrastructure/action-store/entities/mysql-action';
import {FoldersService} from './folders/folders.service';
import {NotebookController} from './notebooks/notebooks.controller';
import {NotebookService} from './notebooks/notebooks.service';
jest.setTimeout(60000);

describe('web-api module', () => {
  let module: TestingModule;
  let noteRepo: Repository<DbNote>;
  let notebookRepo: Repository<DbNotebook>;
  let folderRepo: Repository<DbFolder>;
  let eventsRepo: Repository<MySqlAction>;
  let fileTreeRepo: FileTreeRepository;
  let folderService: FoldersService;
  let notebookService: NotebookService;
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
    await conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS=1'
        : 'PRAGMA foreign_keys = ON',
    );
  }
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (cs: ConfigService) =>
            cs.getDbConnection([
              DbFileTreeNode,
              DbFolder,
              DbNote,
              DbNotebook,
              MySqlAction,
            ]),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([
          DbFileTreeNode,
          DbFolder,
          DbNote,
          DbNotebook,
          MySqlAction,
          FileTreeRepository,
        ]),
      ],
      providers: [FoldersService, NotebookService, NotebookController],
      exports: [],
    }).compile();

    notebookRepo = module.get<Repository<DbNotebook>>(
      getRepositoryToken(DbNotebook),
    );
    noteRepo = module.get<Repository<DbNote>>(getRepositoryToken(DbNote));
    eventsRepo = module.get<Repository<MySqlAction>>(
      getRepositoryToken(MySqlAction),
    );
    fileTreeRepo = module.get<FileTreeRepository>(FileTreeRepository);
    folderRepo = module.get<Repository<DbFolder>>(getRepositoryToken(DbFolder));
    folderService = module.get(FoldersService);
    notebookService = module.get(NotebookService);
    conn = module.get<Connection>(getConnectionToken());
    configService = module.get(ConfigService);
  });

  beforeEach(async () => await clearDb());
  afterAll(() => module.close());

  describe('foldersService', () => {
    describe('getPathList', () => {
      it('get a path list with notebooks inside a folder', async () => {
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
          owner: defaultUser,
          type: FileType.folder,
          files: [
            {
              id: subsubFolderNode.id,
              dateCreated: expect.any(Number),
              dateUpdated: expect.any(Number),
              type: FileType.folder,
              name: 'folderName3',
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

      const response = await notebookService.getId(notebook.id);
      expect(response!.id).toBe(notebook.id);
      expect(response!.path).toEqual([
        {name: 'folderName', id: folderNode.id},
        {name: 'folderName2', id: folderNode2.id},
      ]);
    });
  });
});

function createNotebookNode(defaultUser: string, notebookName: string) {
  const notebook = new DbNotebook();
  notebook.id = uuid();
  notebook.owner = defaultUser;
  notebook.name = notebookName;

  const notebookNode = new DbFileTreeNode();
  notebookNode.id = uuid();
  notebookNode.owner = defaultUser;
  notebookNode.notebookId = notebook.id;
  notebookNode.type = FileType.notebook;
  return [notebookNode, notebook] as const;
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
