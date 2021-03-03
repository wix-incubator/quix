/* Helper driver for event-bus tests */
/* tslint:disable:no-non-null-assertion */

import {Test, TestingModule} from '@nestjs/testing';
import {
  getConnectionToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '../../config';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
  DbFavorites,
  DbUser,
} from '../../entities';
import {MockDataBuilder} from '../../../test/builder';
import {Connection, Repository} from 'typeorm';
import {EventSourcingModule} from './event-sourcing.module';
import {DbAction} from './infrastructure/action-store/entities/db-action.entity';
import {QuixEventBus} from './quix-event-bus';
import {EntityType} from '../../common/entity-type.enum';

export class QuixEventBusDriver {
  public mockBuilder: MockDataBuilder;

  constructor(
    public eventBus: QuixEventBus,
    public module: TestingModule,
    public noteRepo: Repository<DbNote>,
    public notebookRepo: Repository<DbNotebook>,
    public eventsRepo: Repository<DbAction>,
    public folderRepo: Repository<DbFolder>,
    public fileTreeRepo: Repository<DbFileTreeNode>,
    public favoritesRepo: Repository<DbFavorites>,
    public userRepo: Repository<DbUser>,
    private conn: Connection,
    private configService: ConfigService,
    private defaultUser: string,
  ) {
    this.mockBuilder = new MockDataBuilder(defaultUser);
  }

  static async create(defaultUser: string) {
    const module = await Test.createTestingModule({
      imports: [
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
              DbFavorites,
              DbUser,
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
    const favoritesRepo: Repository<DbFavorites> = module.get(
      getRepositoryToken(DbFavorites),
    );
    const userRepo: Repository<DbUser> = module.get(getRepositoryToken(DbUser));
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
      favoritesRepo,
      userRepo,
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
    await this.clearFavorites();
    await this.userRepo.clear();
    await this.conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS = 1'
        : 'PRAGMA foreign_keys = ON',
    );
  }

  getNotebook(id: string) {
    return {
      and: {
        expectToBeDefined: async () => {
          const notebook = await this.notebookRepo.findOneOrFail(id);
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

  getFavorite(owner: string, entityId: string, entityType: EntityType) {
    return {
      and: {
        expectToBeDefined: async () => {
          const favorite = await this.favoritesRepo.findOneOrFail({
            entityId,
            entityType,
            owner,
          });

          expect(favorite).toBeDefined();

          return favorite;
        },
        expectToBeUndefined: async () => {
          const favorite = await this.favoritesRepo.findOne({
            entityId,
            entityType,
            owner,
          });

          expect(favorite).not.toBeDefined();

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

  async getUsers() {
    return this.userRepo.find();
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

  async clearFavorites() {
    return this.favoritesRepo.delete({});
  }

  emitAsUser(eventBus: QuixEventBus, actions: any[], user = this.defaultUser) {
    return eventBus.emit(actions.map(a => Object.assign(a, {user})));
  }

  async clearFolders() {
    await this.folderRepo.delete({});
    await this.fileTreeRepo.delete({});
  }
}
