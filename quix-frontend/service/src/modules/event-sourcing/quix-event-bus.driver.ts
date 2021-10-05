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
  DbDeletedNotebook,
} from '../../entities';
import {MockDataBuilder} from '../../../test/builder';
import {Connection, Repository} from 'typeorm';
import {EventSourcingModule} from './event-sourcing.module';
import {DbAction} from './infrastructure/action-store/entities/db-action.entity';
import {QuixEventBus} from './quix-event-bus';
import {EntityType} from '../../common/entity-type.enum';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export class QuixEventBusDriver {
  public mockBuilder: MockDataBuilder;

  constructor(
    public eventBus: QuixEventBus,
    public module: TestingModule,
    public noteRepo: Repository<DbNote>,
    public notebookRepo: Repository<DbNotebook>,
    public deletedNotebookRepo: Repository<DbDeletedNotebook>,
    public eventsRepo: Repository<DbAction>,
    public folderRepo: Repository<DbFolder>,
    public fileTreeRepo: Repository<DbFileTreeNode>,
    public favoritesRepo: Repository<DbFavorites>,
    public userRepo: Repository<DbUser>,
    private conn: Connection,
    private configService: ConfigService,
    private defaultUserId: string,
  ) {
    this.mockBuilder = new MockDataBuilder(defaultUserId);
  }

  static async create(defaultUserId: string) {
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
              DbDeletedNotebook,
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

    const getRepository = (entity: EntityClassOrSchema) =>
      module.get(getRepositoryToken(entity));

    const eventBus: QuixEventBus = module.get(QuixEventBus);
    const notebookRepo: Repository<DbNotebook> = getRepository(DbNotebook);

    const deletedNotebookRepo: Repository<DbDeletedNotebook> =
      getRepository(DbDeletedNotebook);

    const noteRepo: Repository<DbNote> = getRepository(DbNote);
    const eventsRepo: Repository<DbAction> = getRepository(DbAction);

    const fileTreeRepo: FileTreeRepository = getRepository(FileTreeRepository);

    const folderRepo: Repository<DbFolder> = getRepository(DbFolder);
    const favoritesRepo: Repository<DbFavorites> = getRepository(DbFavorites);

    const userRepo: Repository<DbUser> = getRepository(DbUser);
    const conn: Connection = module.get(getConnectionToken());
    const configService: ConfigService = module.get(ConfigService);

    return new QuixEventBusDriver(
      eventBus,
      module,
      noteRepo,
      notebookRepo,
      deletedNotebookRepo,
      eventsRepo,
      folderRepo,
      fileTreeRepo,
      favoritesRepo,
      userRepo,
      conn,
      configService,
      defaultUserId,
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
    await this.clearDeletedNotebooks();
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

  getDeletedNotebook(id: string) {
    return {
      and: {
        expectToBeDefined: async () => {
          const deletedNotebook = await this.deletedNotebookRepo.findOneOrFail(
            id,
          );
          expect(deletedNotebook).toBeDefined();
          return deletedNotebook;
        },
        expectToBeUndefined: async () => {
          const deletedNotebook = await this.deletedNotebookRepo.findOne(id);
          expect(deletedNotebook).not.toBeDefined();
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

  async getNotesForNotebook(notebookId: string) {
    return this.noteRepo.find({notebookId});
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
  async clearDeletedNotebooks() {
    return this.deletedNotebookRepo.delete({});
  }

  async clearFavorites() {
    return this.favoritesRepo.delete({});
  }

  emitAsUser(
    eventBus: QuixEventBus,
    actions: any[],
    user = this.defaultUserId,
  ) {
    return eventBus.emit(actions.map(a => Object.assign(a, {user})));
  }

  async clearFolders() {
    await this.folderRepo.delete({});
    await this.fileTreeRepo.delete({});
  }
}
