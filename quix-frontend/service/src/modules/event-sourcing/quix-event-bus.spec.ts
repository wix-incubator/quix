/* tslint:disable:no-shadowed-variable */
/* tslint:disable:no-non-null-assertion */

import {TestingModule} from '@nestjs/testing';
import 'reflect-metadata';
import {INote, NoteActions, createNote} from 'shared/entities/note';
import {NoteActionT} from 'shared/entities/note/actions';
import {NotebookActions} from 'shared/entities/notebook';
import {FileActions, FileType} from 'shared/entities/file';
import {QuixEventBus} from './quix-event-bus';
import {QuixEventBusDriver} from './quix-event-bus.driver';
import {range, reject, find} from 'lodash';
import {EntityType} from 'common/entity-type.enum';

jest.setTimeout(30000);

const defaultUser = 'someUser@wix.com';

describe('event sourcing', () => {
  let driver: QuixEventBusDriver;

  let eventBus: QuixEventBus;
  let module: TestingModule;
  // let notebookRepo: Repository<DbNotebook>;
  // let noteRepo: Repository<DbNote>;

  beforeAll(async () => {
    driver = await QuixEventBusDriver.create(defaultUser);
    ({eventBus, module} = await driver);
  });

  beforeEach(() => driver.clearDb());
  afterAll(() => driver.clearDb());

  afterAll(() => module.close());

  describe('notebooks::', () => {
    let id: string;
    let createAction: NotebookActions;

    beforeEach(() => {
      [id, createAction] = driver.createNotebookAction();
    });

    it('create notebook', async () => {
      await driver.emitAsUser(eventBus, [createAction]);
      const notebook = await driver.getNotebook(id).and.expectToBeDefined();

      expect(notebook.id).toBe(createAction.id);
    });

    it('set owner correctly', async () => {
      await driver.emitAsUser(eventBus, [createAction]);
      const notebook = await driver.getNotebook(id).and.expectToBeDefined();

      expect(notebook.owner).toBe(defaultUser);
    });

    it('update name', async () => {
      await driver.emitAsUser(eventBus, [
        createAction,
        NotebookActions.updateName(id, 'newName'),
      ]);

      const notebook = await driver.getNotebook(id).and.expectToBeDefined();

      expect(notebook.name).toBe('newName');
    });

    it('toggle isLiked', async () => {
      await driver.emitAsUser(eventBus, [
        createAction,
        NotebookActions.toggleIsLiked(id, true),
      ]);

      await driver.getNotebook(id).and.expectToBeDefined();

      await driver
        .getFavorite(defaultUser, id, EntityType.Notebook)
        .and.expectToBeDefined();

      await driver.emitAsUser(eventBus, [
        NotebookActions.toggleIsLiked(id, false),
      ]);

      await driver
        .getFavorite(defaultUser, id, EntityType.Notebook)
        .and.expectToBeUndefined();
    });

    it('delete', async () => {
      await eventBus.emit(createAction);
      const notebook = await driver.getNotebook(id).and.expectToBeDefined();

      expect(notebook.id).toBe(createAction.id);

      await driver.emitAsUser(eventBus, [NotebookActions.deleteNotebook(id)]);

      await driver.getNotebook(id).and.expectToBeUndefined();
    });
  });

  describe('notes::', () => {
    let notebookId: string;
    let createNotebookAction: NotebookActions;
    let addNoteAction: NoteActionT<'note.create'>;
    let note: INote;

    beforeEach(() => {
      [notebookId, createNotebookAction] = driver.createNotebookAction();
      note = createNote(notebookId);
      addNoteAction = NoteActions.addNote(note.id, note);
    });

    it('create note', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction]);
      await driver.emitAsUser(eventBus, [addNoteAction]);

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
    });

    it('create note with bulk actions', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
      const {id, name, notebookId: parent, type} = note;
      expect(notebook.notes[0]).toMatchObject(
        expect.objectContaining({
          id,
          name,
          notebookId: parent,
          owner: defaultUser,
          type,
        }),
      );
    });

    it('update name', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);

      await driver.emitAsUser(eventBus, [
        NoteActions.updateName(note.id, 'changedName'),
      ]);
      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes[0].name).toBe('changedName');
    });

    it('delete note', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);

      await driver.emitAsUser(eventBus, [NoteActions.deleteNote(note.id)]);
      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(0);
    });

    it('update content', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);

      await driver.emitAsUser(eventBus, [
        NoteActions.updateContent(note.id, 'select foo from bar'),
      ]);
      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes[0].content).toBe('select foo from bar');
    });

    it('move note between notebook', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);
      const [
        secondNotebookId,
        createNotebookAction2,
      ] = driver.createNotebookAction();

      await driver.emitAsUser(eventBus, [createNotebookAction2]);

      await driver.emitAsUser(eventBus, [
        NoteActions.move(note.id, secondNotebookId),
      ]);

      const notebook = await driver.getNotebookWithNotes(notebookId);
      expect(notebook.notes).toHaveLength(0);

      const secondNotebook = await driver.getNotebookWithNotes(
        secondNotebookId,
      );
      expect(secondNotebook.notes).toHaveLength(1);
    });

    describe('note rank/order', () => {
      let notes: INote[];
      let createNoteActions: NoteActionT<'note.create'>[];
      const howManyNotes = 6;

      beforeEach(async () => {
        notes = range(howManyNotes).map(() => createNote(notebookId));
        createNoteActions = notes.map(n => NoteActions.addNote(n.id, n));

        await driver.emitAsUser(eventBus, [createNotebookAction]);
        await driver.emitAsUser(eventBus, createNoteActions);
      });

      it('should create new notes with correct order', async () => {
        const notebook = await driver.getNotebookWithNotes(notebookId);
        const doesRankMatchInsertOrder = notes.every(
          (note, index) =>
            notebook.notes.find(n => n.id === note.id)!.rank === index,
        );

        expect(doesRankMatchInsertOrder).toBeTruthy();
      });

      const deleteCases = [
        [0, 'start'],
        [howManyNotes - 1, 'end'],
        [3, 'middle'],
      ] as const;

      deleteCases.forEach(([noteIndexToDelete, testName]) => {
        it(`on delete should set order of remaining notes correctly, when removing from ${testName}`, async () => {
          const noteIdToDelete = notes[noteIndexToDelete].id;
          const deleteAction = NoteActions.deleteNote(noteIdToDelete);
          await driver.emitAsUser(eventBus, [deleteAction]);

          const filteredNotes = reject(notes, {id: noteIdToDelete});

          const notebook = await driver.getNotebookWithNotes(notebookId);
          const doesRankMatchInsertOrder = filteredNotes.every(
            (note, index) =>
              notebook.notes.find(n => n.id === note.id)!.rank === index,
          );

          expect(doesRankMatchInsertOrder).toBeTruthy();
        });
      });

      const reorderCases = [
        [4, 2, '"from" greater than "to"'],
        [1, 5, '"to" greater than "from"'],
      ] as const;

      reorderCases.forEach(([from, to, testName]) => {
        it(`reorder notes correctly, when ${testName}`, async () => {
          const noteIdMove = notes[from].id;
          const reorderAction = NoteActions.reorderNote(noteIdMove, to);
          await driver.emitAsUser(eventBus, [reorderAction]);

          const reorderdNotes = reorderPos(notes, from, to);
          const notebook = await driver.getNotebookWithNotes(notebookId);

          const doesRankMatchInsertOrder = reorderdNotes.every(
            (note, index) =>
              notebook.notes.find(n => n.id === note.id)!.rank === index,
          );

          expect(doesRankMatchInsertOrder).toBeTruthy();
        });
      });
    });
  });

  describe('folder tree::', () => {
    let folderId: string;
    let createFolderAction: any;
    let notebookId: string;
    let createNotebookAction: any;

    beforeEach(() => {
      [folderId, createFolderAction] = driver.createFolderAction(
        'rootFolder',
        [],
      );
      [notebookId, createNotebookAction] = driver.createNotebookAction([
        {id: folderId},
      ]);
    });

    it('a single folder', async () => {
      await driver.emitAsUser(eventBus, [createFolderAction]);

      const list = await driver.getUserFileTree(defaultUser);
      expect(list[0].folder!.name).toBe('rootFolder');
    });

    it('rename folder', async () => {
      await driver.emitAsUser(eventBus, [createFolderAction]);
      await driver.emitAsUser(eventBus, [
        FileActions.updateName(folderId, 'a changedName'),
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      expect(list[0].folder!.name).toBe('a changedName');
    });

    it('a notebook inside a single folder', async () => {
      await driver.emitAsUser(eventBus, [
        createFolderAction,
        createNotebookAction,
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      const notebookTreeItem = list.find(
        item => item.id === notebookId && item.parentId === folderId,
      );
      expect(notebookTreeItem).toBeDefined();
    });

    it('have multiple notebooks inside a single folder', async () => {
      const [notebookId2, createNotebookAction2] = driver.createNotebookAction([
        {id: folderId},
      ]);
      await driver.emitAsUser(eventBus, [
        createFolderAction,
        createNotebookAction,
        createNotebookAction2,
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      const notebookItems = list.filter(
        item => item.type === FileType.notebook,
      );
      expect(notebookItems).toHaveLength(2);
    });

    it('notebook move', async () => {
      const [subFolder1, createSubFolder1] = driver.createFolderAction(
        'subFolder1',
        [{id: folderId}],
      );

      await driver.emitAsUser(eventBus, [
        createFolderAction,
        createSubFolder1,
        createNotebookAction,
      ]);

      await driver.emitAsUser(eventBus, [
        NotebookActions.moveNotebook(notebookId, [{id: subFolder1, name: ''}]),
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      const notebook = list.find(item => item.id === notebookId);
      expect(notebook!.mpath).toBe(`${folderId}.${subFolder1}.${notebookId}`);
    });

    it('folder tree move', async () => {
      const [subFolder1, createSubFolder1] = driver.createFolderAction(
        'subFolder1',
        [{id: folderId}],
      );

      const [subFolder2, createSubFolder2] = driver.createFolderAction(
        'subFolder2',
        [{id: subFolder1}],
      );

      const [subFolder3, createSubFolder3] = driver.createFolderAction(
        'subFolder3',
        [{id: folderId}],
      );

      const [notebookId, createNotebookAction] = driver.createNotebookAction([
        {id: subFolder2},
      ]);

      await driver.emitAsUser(eventBus, [
        createFolderAction,
        createSubFolder1,
        createSubFolder2,
        createSubFolder3,
        createNotebookAction,
      ]);

      /**
       * structure:
       * rootFolder ->
       *           folder1 ->
       *             folder2->
       *               notebook
       *           folder3
       */

      await driver.emitAsUser(eventBus, [
        FileActions.moveFile(subFolder1, [{id: subFolder3, name: ''}]),
      ]);

      /**
       * structure:
       * rootFolder ->
       *           folder3 ->
       *             folder1 ->
       *               folder2->
       *                 notebook
       */

      const list = await driver.getUserFileTree(defaultUser);
      expect(find(list, {id: subFolder1})).toMatchObject({
        parentId: subFolder3,
      });
      expect(find(list, {id: notebookId})).toMatchObject({
        mpath: [folderId, subFolder3, subFolder1, subFolder2, notebookId].join(
          '.',
        ),
      });
      expect(find(list, {id: subFolder2})).toMatchObject({
        mpath: [folderId, subFolder3, subFolder1, subFolder2].join('.'),
      });
    });

    it('delete an empty folder', async () => {
      const [subFolder1, createSubFolder1] = driver.createFolderAction(
        'subFolder1',
        [{id: folderId}],
      );

      await driver.emitAsUser(eventBus, [createFolderAction, createSubFolder1]);
      const beforeList = await driver.getUserFileTree(defaultUser);
      expect(beforeList).toHaveLength(2);

      await driver.emitAsUser(eventBus, [FileActions.deleteFile(subFolder1)]);

      const afterList = await driver.getUserFileTree(defaultUser);
      expect(afterList).toMatchObject([
        expect.objectContaining({id: folderId}),
      ]);
    });

    it('recursively delete a folder', async () => {
      const [subFolder1, createSubFolder1] = driver.createFolderAction(
        'subFolder1',
        [{id: folderId}],
      );

      const [subFolder2, createSubFolder2] = driver.createFolderAction(
        'subFolder2',
        [{id: subFolder1}],
      );

      const [subFolder3, createSubFolder3] = driver.createFolderAction(
        'subFolder3',
        [{id: subFolder2}],
      );

      const [notebookId, createNotebookAction] = driver.createNotebookAction([
        {id: subFolder2},
      ]);

      await driver.emitAsUser(eventBus, [
        createFolderAction,
        createSubFolder1,
        createSubFolder2,
        createSubFolder3,
        createNotebookAction,
      ]);

      await driver.emitAsUser(eventBus, [FileActions.deleteFile(subFolder1)]);
      const afterList = await driver.getUserFileTree(defaultUser);

      expect(afterList).toMatchObject([
        expect.objectContaining({id: folderId}),
      ]);
      /* Checking that deletion deletes entities from other tables */
      await driver.getNotebook(notebookId).and.expectToBeUndefined();
      expect(await driver.folderRepo.find()).toHaveLength(1);
    });
  });
});

function reorderPos<T>(items: T[], from: number, to: number) {
  const clone = items.slice();
  const [item] = clone.splice(from, 1);
  clone.splice(to, 0, item);

  return clone;
}
