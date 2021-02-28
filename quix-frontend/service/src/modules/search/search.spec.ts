import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import 'reflect-metadata';
import {Repository} from 'typeorm';
import uuid from 'uuid/v4';
import {ConfigService, ConfigModule} from '../../config';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {SearchModule} from './search.module';
import {SearchService} from './search';
import {Chance} from 'chance';
import {range} from 'lodash';
import {INote} from '@wix/quix-shared';

const chance = new Chance();

describe('Search', () => {
  jest.setTimeout(60000);
  let module: TestingModule;
  let searchService: SearchService;
  let noteRepo: Repository<DbNote>;
  let notebookRepo: Repository<DbNotebook>;
  const defaultUser = 'foo@wix.com';
  const secondUser = 'bar@wix.com';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.create(),
        TypeOrmModule.forRootAsync({
          imports: [],
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

    searchService = module.get(SearchService);
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
        textContent: '',
        type: 'presto',
      },
      template,
    );
    const note = new DbNote({
      id: base.id,
      owner: base.owner,
      type: base.type,
      textContent: base.textContent,
      name: base.name,
      dateCreated: 1,
      dateUpdated: 1,
      notebookId,
      jsonContent: undefined,
      richContent: {},
    });
    note.rank = 0;
    return noteRepo.save(note);
  };

  const createRandomNotes = async (baseString = '', count = 5) => {
    const {id: notebookId} = await createNotebook();
    return Promise.all(
      range(count).map(() => {
        return createNote(notebookId, {
          textContent: baseString + chance.paragraph(),
        });
      }),
    );
  };

  it('should return empty array for empty content', async () => {
    const [result] = await searchService.search('');
    expect(result).toHaveLength(0);
  });

  it('should get note by owner', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id);

    const [result] = await searchService.search(`user:${defaultUser}`);
    const [badResult] = await searchService.search('user: foo@wix.com');

    expect(result[0].id).toBe(note.id);
    expect(badResult).toHaveLength(0);
  });

  it('should get note by content', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      textContent: 'select someColumn from someCatalog.someTable',
    });
    const note2 = await createNote(notebook.id, {
      textContent: 'select someColumn from someCatalog.someOtherTable',
    });

    const [result] = await searchService.search(`someTable`);
    const [result2] = await searchService.search(`someOtherTable`);
    const [badResult] = await searchService.search('randomKeyword');

    expect(result[0].id).toBe(note.id);
    expect(result2[0].id).toBe(note2.id);
    expect(badResult).toHaveLength(0);
  });

  it('should actually return a proper note', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      textContent: 'select someColumn from someCatalog.someTable',
    });

    const [result] = await searchService.search(`someTable`);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      content: note.textContent,
      id: note.id,
    } as Partial<INote>);
  });

  it('should get note by content, partial keywords', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      textContent: 'select someColumn from someCatalog.someTable',
    });
    const note2 = await createNote(notebook.id, {
      textContent: 'select someColumn from someCatalog.someOtherTable',
    });

    await noteRepo.save(note2);
    const [notes, length] = await searchService.search(`someCa`);
    const badResult = await searchService.search('randomKeyword');
    const [badNotes, badLength] = badResult;

    expect(length).toBe(2);
    expect(badLength).toBe(0);
  });

  it('should get note by type', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      type: 'python' as any,
    });
    const note2 = await createNote(notebook.id, {
      type: 'presto',
    });

    const [result] = await searchService.search('type:presto');

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
      type: 'presto',
    });
    const note3 = await createNote(notebook2.id, {
      owner: secondUser,
      type: 'python' as any,
    });
    const [result] = await searchService.search(
      `user:${secondUser} type:python`,
    );

    expect(result).toMatchObject([expect.objectContaining({id: note3.id})]);
  });

  it('full phrase search', async () => {
    const notebook = await createNotebook();
    const note = await createNote(notebook.id, {
      textContent: 'select col1, col2, col3 from foo where col1 = 1',
    });
    const note2 = await createNote(notebook.id, {
      textContent: 'select col1, col2, col3 from foo where col2 = 1',
    });

    const [result] = await searchService.search(`col1 = 1`);
    const [fullResult] = await searchService.search(`"col1 = 1"`);

    expect(result).toHaveLength(2);
    expect(fullResult).toMatchObject([expect.objectContaining({id: note.id})]);
  });

  describe('pagination', () => {
    it('should return correct number of results', async () => {
      await createRandomNotes('searchStringFoo', 20);
      await createRandomNotes('searchStringBar', 10);

      const [_, count] = await searchService.search('searchStringFoo', 5, 0);
      expect(count).toBe(20);
      const [__, count2] = await searchService.search('searchStringBar', 5, 0);
      expect(count2).toBe(10);
    });

    it('should handle request outside of range', async () => {
      await createRandomNotes('searchStringFoo', 20);
      await createRandomNotes('searchStringBar', 10);

      const [notes, count] = await searchService.search(
        'searchStringFoo',
        5,
        20,
      );
      expect(notes).toHaveLength(0);
    });

    it('should return pages correctly', async () => {
      let notes = await createRandomNotes('searchStringFoo', 20);
      await createRandomNotes('searchStringBar', 10);

      let offset = 0;
      const count = 5;
      let pagesFetched = 0;
      while (notes.length) {
        const [returnedNotes, totalCount] = await searchService.search(
          'searchStringFoo',
          count,
          offset,
        );
        pagesFetched++;
        expect(totalCount).toBe(20);
        expect(returnedNotes).toHaveLength(count);

        offset += count;

        notes = notes.filter(
          note => !returnedNotes.find(n => n.id === note.id),
        );
      }
      expect(pagesFetched).toBe(4);
    });
  });

  afterAll(() => {
    module.close();
  });
});
