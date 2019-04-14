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
  // let eventBus: QuixEventBus;

  async function clearDb() {
    const dbType = configService.getDbType();
    await conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS = 0'
        : 'PRAGMA foreign_keys = OFF',
    );
    await eventsRepo.delete({});
    await noteRepo.delete({});
    await folderRepo.delete({});
    await notebookRepo.delete({});
    await fileTreeRepo.clear();
    await conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS = 1'
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

    // eventBus = module.get(QuixEventBus);
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

  beforeEach(() => clearDb());
  afterAll(() => module.close());

  describe('foldersService', () => {
    describe('getRawList', () => {
      it('get a list with only one folder', async () => {
        const folderNode = createFolderNode(defaultUser, 'folderName');
        await fileTreeRepo.save(folderNode);

        const list = await folderService.getRawList(defaultUser);
        expect(list![0].folder).toMatchObject(
          expect.objectContaining({name: 'folderName', owner: defaultUser}),
        );
      });

      it('get a list with notebooks inside a folder', async () => {
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

        const list = await folderService.getRawList(defaultUser);

        expect(
          list!.find(n => n.parentId === folderNode.id)!.notebook!.name,
        ).toBe(notebookName);
      });

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

          const list = await folderService.getPathList(defaultUser);

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

          const list = await folderService.getPathList(defaultUser);
          expect(list).toHaveLength(2);
        });
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
