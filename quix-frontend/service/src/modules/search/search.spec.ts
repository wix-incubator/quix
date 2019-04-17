import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import 'reflect-metadata';
import {Repository} from 'typeorm';
import uuid from 'uuid/v4';
import {NoteType} from '../../../../shared/entities/note';
import {ConfigService, ConfigModule} from 'config';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {SearchController} from './search.controller';
import {SearchModule} from './search.module';

describe('Search', () => {
  let module: TestingModule;
  let searchCtrl: SearchController;
  let noteRepo: Repository<DbNote>;
  let notebookRepo: Repository<DbNotebook>;
  const defaultUser = 'foo@wix.com';
  const secondUser = 'bar@wix.com';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            configService.getDbConnection([
              DbFileTreeNode,
              DbFolder,
              DbNote,
              DbNotebook,
            ]),
          inject: [ConfigService],
        }),
        SearchModule,
      ],
      providers: [],
      exports: [],
    }).compile();

    searchCtrl = module.get(SearchController);
    noteRepo = module.get(getRepositoryToken(DbNote));
    notebookRepo = module.get(getRepositoryToken(DbNotebook));
  });

  beforeEach(async () => {
    await noteRepo.delete({});
    await notebookRepo.delete({});
  });

  const createNotebook = async (user = defaultUser) => {
    const notebook = new DbNotebook({
      id: uuid(),
      owner: user,
      name: 'new name',
    } as any);
    return notebookRepo.save(notebook);
  };

  const createNote = async (
    notebookId: string,
    template: Partial<DbNote> = {},
  ) => {
    const base = Object.assign(
      {
        id: uuid(),
        name: 'New Note',
        owner: defaultUser,
        content: '',
        type: NoteType.PRESTO as NoteType.PRESTO,
      },
      template,
    );
    const note = new DbNote({
      id: base.id,
      owner: base.owner,
      type: base.type,
      content: base.content,
      name: base.name,
      dateCreated: 1,
      dateUpdated: 1,
      notebookId,
    });
    return noteRepo.save(note);
  };

  it('should return empty array for empty content', async () => {
    const result = await searchCtrl.doSearch('');
    expect(result).toHaveLength(0);
  });

  it('should get note by owner', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id);

    const result = await searchCtrl.doSearch(`user:${defaultUser}`);
    const badResult = await searchCtrl.doSearch('user: foo@wix.com');

    expect(result[0].id).toBe(note.id);
    expect(badResult).toHaveLength(0);
  });

  it('should get note by content', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      content: 'select someColumn from someCatalog.someTable',
    });
    const note2 = await createNote(notebook.id, {
      content: 'select someColumn from someCatalog.someOtherTable',
    });

    await noteRepo.save(note2);
    const result = await searchCtrl.doSearch(`someTable`);
    const result2 = await searchCtrl.doSearch(`someOtherTable`);
    const badResult = await searchCtrl.doSearch('randomKeyword');

    expect(result[0].id).toBe(note.id);
    expect(result2[0].id).toBe(note2.id);
    expect(badResult).toHaveLength(0);
  });

  it('should get note by type', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      type: 'python' as any,
    });
    const note2 = await createNote(notebook.id, {
      type: NoteType.PRESTO,
    });

    const result = await searchCtrl.doSearch('type:presto');

    expect(result).toMatchObject([expect.objectContaining({id: note2.id})]);
  });

  it('should get note by user and type', async () => {
    const notebook = await createNotebook(defaultUser);
    const notebook2 = await createNotebook(secondUser);
    const note = await createNote(notebook.id, {
      owner: defaultUser,
    });
    const note2 = await createNote(notebook2.id, {
      owner: secondUser,
      type: NoteType.PRESTO,
    });
    const note3 = await createNote(notebook2.id, {
      owner: secondUser,
      type: 'python' as any,
    });
    const result = await searchCtrl.doSearch(`user:${secondUser} type:python`);

    expect(result).toMatchObject([expect.objectContaining({id: note3.id})]);
  });

  it('full phrase search', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      content: 'select col1, col2, col3 from foo where col1 = 1',
    });
    const note2 = await createNote(notebook.id, {
      content: 'select col1, col2, col3 from foo where col2 = 1',
    });

    const result = await searchCtrl.doSearch(`col1 = 1`);
    const fullResult = await searchCtrl.doSearch(`"col1 = 1"`);

    expect(result).toHaveLength(2);
    expect(fullResult).toMatchObject([expect.objectContaining({id: note.id})]);
  });

  afterAll(() => {
    module.close();
  });
});
