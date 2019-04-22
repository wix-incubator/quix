/* Helper driver for event-bus tests */
import {ConfigService, ConfigModule} from 'config';

import {EventSourcingModule} from './event-sourcing.module';
import {Test, TestingModule} from '@nestjs/testing';
import {
  getRepositoryToken,
  TypeOrmModule,
  getEntityManagerToken,
  getConnectionToken,
  getCustomRepositoryToken,
} from '@nestjs/typeorm';
import {DbNotebook, DbNote, DbFileTreeNode, DbFolder} from 'entities';
import {DbAction} from './infrastructure/action-store/entities/db-action';
import {Repository, EntityManager, IsNull, Connection} from 'typeorm';
import {QuixEventBus} from './quix-event-bus';
import * as uuid from 'uuid';
import {NotebookActions, createNotebook} from 'shared/entities/notebook';
import {FileActions, FileType, IFilePathItem} from 'shared/entities/file';
import {AuthModule} from 'modules/auth/auth.module';
import {FileTreeRepository} from 'entities/filenode.repository';
import {dbConf} from 'config/db-conf';
import {} from 'shared/entities/file';

export class QuixEventBusDriver {
  constructor(
    public eventBus: QuixEventBus,
    public module: TestingModule,
    public noteRepo: Repository<DbNote>,
    public notebookRepo: Repository<DbNotebook>,
    public eventsRepo: Repository<DbAction>,
    public folderRepo: Repository<DbFolder>,
    public fileTreeRepo: Repository<DbFileTreeNode>,
    private conn: Connection,
    private configService: ConfigService,
    private defaultUser: string,
  ) {}

  static async create(defaultUser: string) {
    let eventBus: QuixEventBus;
    let module: TestingModule;
    let notebookRepo: Repository<DbNotebook>;
    let noteRepo: Repository<DbNote>;
    let eventsRepo: Repository<DbAction>;
    let folderRepo: Repository<DbFolder>;
    let fileTreeRepo: FileTreeRepository;
    let conn: Connection;
    let configService: ConfigService;

    module = await Test.createTestingModule({
      imports: [
        ConfigModule,
        AuthModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            configService.getDbConnection([
              DbFileTreeNode,
              DbFolder,
              DbNote,
              DbNotebook,
              DbAction,
            ]),
          inject: [ConfigService],
        }),
        EventSourcingModule,
      ],
      providers: [],
      exports: [],
    }).compile();

    eventBus = module.get(QuixEventBus);
    notebookRepo = module.get<Repository<DbNotebook>>(
      getRepositoryToken(DbNotebook),
    );
    noteRepo = module.get<Repository<DbNote>>(getRepositoryToken(DbNote));
    eventsRepo = module.get<Repository<DbAction>>(getRepositoryToken(DbAction));
    fileTreeRepo = module.get<FileTreeRepository>(
      getCustomRepositoryToken(FileTreeRepository),
    );
    folderRepo = module.get<Repository<DbFolder>>(getRepositoryToken(DbFolder));
    conn = module.get<Connection>(getConnectionToken());
    configService = module.get<ConfigService>(ConfigService);

    return new QuixEventBusDriver(
      eventBus,
      module,
      noteRepo,
      notebookRepo,
      eventsRepo,
      folderRepo,
      fileTreeRepo,
      conn,
      configService,
      defaultUser,
    );
  }

  async clearDb() {
    const dbType = this.configService.getDbType();
    await this.conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS = 0'
        : 'PRAGMA foreign_keys = OFF',
    );
    await this.clearEvents();
    await this.clearNotes();
    await this.clearFolders();
    await this.clearNotebooks();
    await this.conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS = 1'
        : 'PRAGMA foreign_keys = ON',
    );
  }

  createNotebookAction(path: IFilePathItem[] = [], user = this.defaultUser) {
    const id = uuid.v4();
    const action = {
      ...NotebookActions.createNotebook(id, createNotebook(path, {id})),
      user,
    };
    return [id, action] as const;
  }

  createFolderAction(
    name: string,
    path: IFilePathItem[],
    user = this.defaultUser,
  ) {
    const id = uuid.v4();
    const action = {
      ...FileActions.createFile(id, {
        id,
        type: FileType.folder,
        name,
        path,
        isLiked: false,
        owner: '',
        dateCreated: 0,
        dateUpdated: 0,
      }),
      user,
    };
    return [id, action] as const;
  }

  getNotebook(id: string) {
    return {
      and: {
        expectToBeDefined: async () => {
          const notebook = (await this.notebookRepo.findOne(id))!;
          expect(notebook).toBeDefined();
          return notebook;
        },
        expectToBeUndefined: async () => {
          const notebook = await this.notebookRepo.findOne(id);
          expect(notebook).not.toBeDefined();
          return undefined;
        },
      },
    };
  }

  async getNotebookWithNotes(id: string) {
    const notebook = (await this.notebookRepo.findOne(id, {
      relations: ['notes'],
    }))!;
    return notebook;
  }

  async getNote(id: string) {
    return this.noteRepo.findOne(id);
  }

  async getFolderDecendents(user: string) {
    const root = await this.fileTreeRepo.findOne(
      {owner: user, parentId: IsNull()},
      {relations: ['notebook', 'folder']},
    );

    if (root) {
      const sub = this.fileTreeRepo
        .createQueryBuilder('root')
        .select('root.mpath')
        .where(`root.id = :id`)
        .getQuery();

      const q = this.fileTreeRepo
        .createQueryBuilder('node')
        .where('node.owner = :user', {user})
        .andWhere(`node.mpath LIKE ${dbConf.concat(`(${sub})`, `'%'`)}`)
        .setParameter('id', root.id)
        .leftJoinAndSelect('node.folder', 'folder')
        .leftJoinAndSelect('node.notebook', 'notebook');

      return q.getMany();
    }
    return [];
  }

  clearEvents() {
    return this.eventsRepo.clear();
  }

  async clearNotes() {
    return this.noteRepo.delete({});
  }

  async clearNotebooks() {
    return this.notebookRepo.delete({});
  }

  emitAsUser(eventBus: QuixEventBus, actions: any[], user = this.defaultUser) {
    return eventBus.emit(actions.map(a => Object.assign(a, {user})));
  }

  async clearFolders() {
    await this.folderRepo.delete({});
    await this.fileTreeRepo.delete({});
  }
}
