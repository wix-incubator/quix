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
import {FileActions, FileType, IFilePathItem} from 'shared/entities/file';
import {createNotebook, NotebookActions} from 'shared/entities/notebook';
import {Connection, Repository} from 'typeorm';
import * as uuid from 'uuid';
import {EventSourcingModule} from './event-sourcing.module';
import {DbAction} from './infrastructure/action-store/entities/db-action.entity';
import {QuixEventBus} from './quix-event-bus';
import {MockDataBuilder} from 'test/builder';

export class QuixEventBusDriver {
  private builder: MockDataBuilder;
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
  ) {
    this.builder = new MockDataBuilder(defaultUser);
  }

  static async create(defaultUser: string) {
    const module = await Test.createTestingModule({
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

    const eventBus: QuixEventBus = module.get(QuixEventBus);
    const notebookRepo: Repository<DbNotebook> = module.get(
      getRepositoryToken(DbNotebook),
    );
    const noteRepo: Repository<DbNote> = module.get(getRepositoryToken(DbNote));
    const eventsRepo: Repository<DbAction> = module.get(
      getRepositoryToken(DbAction),
    );
    const fileTreeRepo: FileTreeRepository = module.get(
      getRepositoryToken(FileTreeRepository),
    );
    const folderRepo: Repository<DbFolder> = module.get(
      getRepositoryToken(DbFolder),
    );
    const conn: Connection = module.get(getConnectionToken());
    const configService: ConfigService = module.get(ConfigService);

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

  createNotebookAction = this.builder.createNotebookAction.bind(this.builder);
  createFolderAction = this.builder.createFolderAction.bind(this.builder);

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
