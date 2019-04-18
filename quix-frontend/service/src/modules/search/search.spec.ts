import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import 'reflect-metadata';
import {Repository} from 'typeorm';
import uuid from 'uuid/v4';
import {NoteType} from '../../../../shared/entities/note';
import {ConfigModule} from '../../config/config.module';
import {ConfigService} from '../../config/config.service';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {SearchController} from './search.controller';
import {SearchModule} from './search.module';

describe('Search', () => {
  const numOfTypeSql = 1;
  const numOfUserFoo = 2;
  const numOfNameEmpty = 1;
  const numOfContentSomeContent = 1;
  const numOfSpecialContent = 1;
  let module: TestingModule;
  let searchCtrl: SearchController;
  let noteRepo: Repository<DbNote>;
  let notebookRepo: Repository<DbNotebook>;
  const defaultUser = 'foo@wix.com';

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

  // it('should return empty array for empty content', async () => {
  //   const result = await searchCtrl.doSearch('');

  //   expect(result).toHaveLength(0);
  // });

  // it('should return empty array if order is wrong', async () => {
  //   const result = await searchCtrl.doSearch('free text user:foo@wix.com');

  //   expect(result).toHaveLength(0);
  // });

  it('should get note by owner', async () => {
    const notebook = new DbNotebook({
      id: uuid(),
      owner: defaultUser,
      name: 'new name',
    } as any);
    await notebookRepo.save(notebook);
    const id = uuid();
    const note = new DbNote({
      id,
      owner: defaultUser,
      type: NoteType.PRESTO,
      content: '',
      name: 'new Note',
      dateCreated: 1,
      dateUpdated: 1,
      notebookId: notebook.id,
    });
    await noteRepo.save(note);
    const result = await searchCtrl.doSearch(`user:${defaultUser}`);
    const badResult = await searchCtrl.doSearch('user: foo@wix.com');

    expect(result[0].id).toBe(id);
    expect(badResult).toHaveLength(0);
  });

  it('should get note by content', async () => {
    const notebook = new DbNotebook({
      id: uuid(),
      owner: defaultUser,
      name: 'new name',
    } as any);
    await notebookRepo.save(notebook);
    const note = new DbNote({
      id: uuid(),
      owner: defaultUser,
      type: NoteType.PRESTO,
      content: 'select someColumn from someCatalog.someTable',
      name: 'new Note',
      dateCreated: 1,
      dateUpdated: 1,
      notebookId: notebook.id,
    });
    await noteRepo.save(note);
    const note2 = new DbNote({
      id: uuid(),
      owner: defaultUser,
      type: NoteType.PRESTO,
      content: 'select someColumn from someCatalog.someOtherTable',
      name: 'new Note',
      dateCreated: 1,
      dateUpdated: 1,
      notebookId: notebook.id,
    });
    await noteRepo.save(note2);
    debugger;
    const result = await searchCtrl.doSearch(`someTable`);
    const result2 = await searchCtrl.doSearch(`someOtherTable`);
    const badResult = await searchCtrl.doSearch('randomKeyword');

    expect(result[0].id).toBe(note.id);
    expect(result2[0].id).toBe(note2.id);
    expect(badResult).toHaveLength(0);
  });

  // it('should get note by type', async () => {
  //   const result = await searchCtrl.doSearch('type:sql');
  //   const upperCaseResult = await searchCtrl.doSearch('type:SQL');
  //   const badResult = await searchCtrl.doSearch('type: sql');

  //   expect(result).toHaveLength(numOfTypeSql);
  //   expect(upperCaseResult).toHaveLength(numOfTypeSql);
  //   expect(badResult).toHaveLength(0);
  // });

  // it('should get note by user and type', async () => {
  //   const result = await searchCtrl.doSearch('user:foo@wix.com type:sql');
  //   const badResult = await searchCtrl.doSearch('user:foo@wix.comtype:sql');

  //   expect(result).toHaveLength(numOfTypeSql);
  //   expect(badResult).toHaveLength(0);
  // });

  // it('should get note by content', async () => {
  //   const result = await searchCtrl.doSearch('some content');
  //   const badResult = await searchCtrl.doSearch('somea');

  //   expect(result).toHaveLength(numOfContentSomeContent);
  //   expect(badResult).toHaveLength(0);
  // });

  // it('should get note with special content', async () => {
  //   const result1 = await searchCtrl.doSearch('%perf');
  //   const result2 = await searchCtrl.doSearch('$');
  //   const result3 = await searchCtrl.doSearch(`\'`);
  //   const result4 = await searchCtrl.doSearch('@');

  //   expect(result1).toHaveLength(numOfSpecialContent);
  //   expect(result2).toHaveLength(numOfSpecialContent);
  //   expect(result3).toHaveLength(numOfSpecialContent);
  //   expect(result4).toHaveLength(numOfSpecialContent);
  // });

  // it('should get note by notebook name', async () => {
  //   const result = await searchCtrl.doSearch('name:emptyNote');
  //   const badResult = await searchCtrl.doSearch('name:empty Note');

  //   expect(result).toHaveLength(numOfNameEmpty);
  //   // assuming spaces is only for free text, can't search for name with spaces
  //   expect(badResult).toHaveLength(0);
  // });

  afterAll(() => {
    module.close();
  });
});
