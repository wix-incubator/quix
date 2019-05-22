/* Helper driver for event-bus tests */
/* tslint:disable:no-non-null-assertion */

import {Test, TestingModule} from '@nestjs/testing';
import {
  getConnectionToken,
  getCustomRepositoryToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from 'config';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
} from 'entities';
import {AuthModule} from 'modules/auth/auth.module';
import {FileActions, FileType, IFilePathItem} from 'shared/entities/file';
import {createNotebook, NotebookActions} from 'shared/entities/notebook';
import {Connection, Repository} from 'typeorm';
import * as uuid from 'uuid';
import {EventSourcingModule} from './event-sourcing.module';
import {DbAction} from './infrastructure/action-store/entities/db-action.entity';
import {QuixEventBus} from './quix-event-bus';

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
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (cs: ConfigService) =>
            cs.getDbConnection([
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
    notebookRepo = module.get(getRepositoryToken(DbNotebook));
    noteRepo = module.get(getRepositoryToken(DbNote));
    eventsRepo = module.get(getRepositoryToken(DbAction));
    fileTreeRepo = module.get(getRepositoryToken(FileTreeRepository));
    folderRepo = module.get(getRepositoryToken(DbFolder));
    conn = module.get(getConnectionToken());
    configService = module.get(ConfigService);

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

  createNotebookAction(
    path: Partial<IFilePathItem>[] = [],
    user = this.defaultUser,
  ) {
    const id = uuid.v4();
    const action = {
      ...NotebookActions.createNotebook(
        id,
        createNotebook(path as IFilePathItem[], {id}),
      ),
      user,
    };
    return [id, action] as const;
  }

  createFolderAction(
    name: string,
    path: {id: string}[],
    user = this.defaultUser,
  ) {
    const id = uuid.v4();
    const action = {
      ...FileActions.createFile(id, {
        id,
        type: FileType.folder,
        name,
        path: path as IFilePathItem[],
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

  async getUserFileTree(user: string) {
    const q = this.fileTreeRepo
      .createQueryBuilder('node')
      .where('node.owner = :user', {user})
      .leftJoinAndSelect('node.folder', 'folder')
      .leftJoinAndSelect('node.notebook', 'notebook');

    return q.getMany();
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
