import {Test, TestingModule} from '@nestjs/testing';
import {
  getConnectionToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import {FileType} from '@wix/quix-shared';
import {EntityType} from 'src/common/entity-type.enum';
import {ConfigModule, ConfigService} from '../../config/';
import {
  DbAction,
  DbDeletedNotebook,
  DbFavorites,
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  DbUser,
  FileTreeRepository,
  NoteRepository,
} from '../../entities';
import {MockDataBuilder} from '../../../test/builder';
import {Connection, Repository} from 'typeorm';
import uuid from 'uuid';
import {AuthModuleConfiguration} from '../auth/auth.module';
import {AuthTypes} from '../auth/types';
import {DeletedNotebooksService} from './deleted-notebooks/deleted-notebook.service';
import {FavoritesService} from './favorites/favorites.service';
import {FoldersService} from './folders/folders.service';
import {NotebookService} from './notebooks/notebooks.service';
import {WebApiModule} from './web-api.module';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

const defaultEntityDate = new Date('1980-05-21T01:02:03').valueOf();
export class WebApiDriver {
  mockBuilder: MockDataBuilder;

  constructor(
    public userRepo: Repository<DbUser>,
    public module: TestingModule,
    public eventsRepo: Repository<DbAction>,
    public fileTreeRepo: FileTreeRepository,

    public notebookRepo: Repository<DbNotebook>,
    public notebookService: NotebookService,
    public noteRepo: NoteRepository,

    public deletedNotebookRepo: Repository<DbDeletedNotebook>,
    public deletedNotebookService: DeletedNotebooksService,

    public folderRepo: Repository<DbFolder>,
    public folderService: FoldersService,

    public favoritesRepo: Repository<DbFavorites>,
    public favoritesService: FavoritesService,

    private configService: ConfigService,
    private conn: Connection,
    private defaultUserId: string,
  ) {
    this.mockBuilder = new MockDataBuilder(defaultUserId);
  }

  static async create(defaultUser: string) {
    const module = await Test.createTestingModule({
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
              DbDeletedNotebook,
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

    const getRepository = (entity: EntityClassOrSchema) =>
      module.get(getRepositoryToken(entity));

    const notebookRepo = getRepository(DbNotebook);
    const notebookService = module.get(NotebookService);

    const deletedNotebookRepo = getRepository(DbDeletedNotebook);

    const deletedNotebookService = module.get(DeletedNotebooksService);

    const favoritesService = module.get(FavoritesService);
    const favoritesRepo = getRepository(DbFavorites);

    const noteRepo = getRepository(NoteRepository);

    const folderRepo = getRepository(DbFolder);
    const folderService = module.get(FoldersService);

    const eventsRepo = getRepository(DbAction);
    const fileTreeRepo = getRepository(FileTreeRepository);

    const userRepo = getRepository(DbUser);
    const conn = module.get(getConnectionToken());
    const configService = module.get(ConfigService);

    return new WebApiDriver(
      userRepo,
      module,
      eventsRepo,
      fileTreeRepo,
      notebookRepo,
      notebookService,
      noteRepo,
      deletedNotebookRepo,
      deletedNotebookService,
      folderRepo,
      folderService,
      favoritesRepo,
      favoritesService,
      configService,
      conn,
      defaultUser,
    );
  }

  async clearDb() {
    const dbType = this.configService.getDbType();
    await this.conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS=0'
        : 'PRAGMA foreign_keys = OFF',
    );
    await this.eventsRepo.delete({});
    await this.noteRepo.delete({});
    await this.folderRepo.delete({});
    await this.notebookRepo.delete({});
    await this.deletedNotebookRepo.delete({});
    await this.fileTreeRepo.clear();
    await this.favoritesRepo.clear();
    await this.userRepo.clear();
    await this.conn.query(
      dbType === 'mysql'
        ? 'SET FOREIGN_KEY_CHECKS=1'
        : 'PRAGMA foreign_keys = ON',
    );
  }

  createUser(props?: Partial<DbUser> | undefined): DbUser {
    const defaultUser = {
      id: this.defaultUserId,
      name: 'some name',
      avatar: 'http://test-url.quix',
      rootFolder: 'someId',
      dateCreated: defaultEntityDate,
      dateUpdated: defaultEntityDate,
    };
    return props ? {...defaultUser, ...props} : defaultUser;
  }

  createNotebook(notebookName = 'New notebook') {
    const notebook = new DbNotebook();

    notebook.id = uuid();
    notebook.owner = this.defaultUserId;
    notebook.name = notebookName;

    return notebook;
  }

  createDeletedNotebook(notebookName = 'Deleted notebook') {
    const deletedNotebook = new DbDeletedNotebook();

    deletedNotebook.id = uuid();
    deletedNotebook.owner = this.defaultUserId;
    deletedNotebook.name = notebookName;
    deletedNotebook.dateDeleted = defaultEntityDate;

    return deletedNotebook;
  }

  createNotebookNode(notebookName: string) {
    const notebook = this.createNotebook(notebookName);
    const notebookNode = new DbFileTreeNode();
    notebookNode.id = uuid();
    notebookNode.owner = this.defaultUserId;
    notebookNode.notebookId = notebook.id;
    notebookNode.type = FileType.notebook;
    return [notebookNode, notebook] as const;
  }

  createNote(noteName: string, notebookId: string) {
    const note = new DbNote({
      id: uuid(),
      owner: this.defaultUserId,
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

  createFolderNode(folderName: string) {
    const folderNode = new DbFileTreeNode();
    folderNode.id = uuid();
    folderNode.owner = this.defaultUserId;
    folderNode.folder = Object.assign(new DbFolder(), {
      id: folderNode.id,
      name: folderName,
      owner: this.defaultUserId,
    });
    return folderNode;
  }

  createFavorite(owner: string, entityId: string, entityType: EntityType) {
    return Object.assign(new DbFavorites(), {
      entityId,
      entityType,
      owner,
    });
  }
}
