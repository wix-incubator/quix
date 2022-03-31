/* tslint:disable:no-shadowed-variable */
/* tslint:disable:no-non-null-assertion */

import {TestingModule} from '@nestjs/testing';
import 'reflect-metadata';
import {INote, NoteActions, createNote} from '@wix/quix-shared/entities/note';
import {NoteActionT} from '@wix/quix-shared/entities/note/actions';
import {NotebookActions} from '@wix/quix-shared/entities/notebook';
import {FileActions, FileType} from '@wix/quix-shared/entities/file';
import {QuixEventBus} from './quix-event-bus';
import {QuixEventBusDriver} from './quix-event-bus.driver';
import {range, reject, find} from 'lodash';
import {EntityType} from '../../common/entity-type.enum';
import {MockDataBuilder} from 'test/builder';
import {IAction, IEventData} from './infrastructure/types';
import {
  DeletedNotebookActions,
  TrashBinActions,
  UserActions,
} from '@wix/quix-shared';

jest.setTimeout(300000);

const defaultUser = 'someUser@wix.com';

describe('event sourcing', () => {
  let driver: QuixEventBusDriver;
  let eventBus: QuixEventBus;
  let module: TestingModule;
  let mockBuilder: MockDataBuilder;

  beforeAll(async () => {
    driver = await QuixEventBusDriver.create(defaultUser);
    ({eventBus, module, mockBuilder} = driver);
  });

  beforeEach(() => driver.clearDb());

  afterAll(() => driver.clearDb());
  afterAll(() => module.close());

  const createNoteAction = (notebookId: string): IAction<IEventData, string> =>
    mockBuilder.createNoteAction(notebookId);

  describe('deleted-notebooks::', () => {
    let notebookId: string;
    let createDeletedNotebookAction: IAction<DeletedNotebookActions>;

    beforeEach(() => {
      [notebookId, createDeletedNotebookAction] =
        mockBuilder.createDeletedNotebookAction();
    });

    it('create deleted-notebook', async () => {
      await driver.emitAsUser(eventBus, [createDeletedNotebookAction]);
      driver.getDeletedNotebook(notebookId).and.expectToBeDefined();
    });

    it('delete deleted-notebook', async () => {
      await driver.emitAsUser(eventBus, [
        createDeletedNotebookAction,
        DeletedNotebookActions.deleteDeletedNotebook(notebookId),
      ]);

      await driver.getDeletedNotebook(notebookId).and.expectToBeUndefined();
    });
  });

  describe('trash-bin::', () => {
    describe('move notebook to Trash Bin', () => {
      let notebookId: string;
      let rootFolderId: string;
      let createRootFolderAction: any;
      let createNotebookAction: IAction<NotebookActions>;

      let addToTrashBinAction: IAction<TrashBinActions>;

      beforeEach(() => {
        [rootFolderId, createRootFolderAction] = mockBuilder.createFolderAction(
          `rootFolder`,
          [],
        );

        [notebookId, createNotebookAction] = mockBuilder.createNotebookAction([
          {id: rootFolderId},
        ]);

        [notebookId, addToTrashBinAction] =
          mockBuilder.moveNotebookToTrashBinAction(undefined, notebookId);
      });

      it('creates deleted notebook', async () => {
        await driver.emitAsUser(eventBus, [
          createRootFolderAction,
          createNotebookAction,
          addToTrashBinAction,
        ]);
        await driver.getDeletedNotebook(notebookId).and.expectToBeDefined();
      });

      it('deletes notebook', async () => {
        await driver.emitAsUser(eventBus, [
          createRootFolderAction,
          createNotebookAction,
          addToTrashBinAction,
        ]);
        await driver.getNotebook(notebookId).and.expectToBeUndefined();
      });

      it('keeps notes', async () => {
        await driver.emitAsUser(eventBus, [
          createRootFolderAction,
          createNotebookAction,
          createNoteAction(notebookId),
          createNoteAction(notebookId),
        ]);

        let notes = await driver.getNotesForNotebook(notebookId);
        expect(notes).toHaveLength(2);

        await driver.emitAsUser(eventBus, [addToTrashBinAction]);
        notes = await driver.getNotesForNotebook(notebookId);
        expect(notes).toHaveLength(2);
      });

      it('deletes file tree nodes', async () => {
        await driver.emitAsUser(eventBus, [
          createRootFolderAction,
          createNotebookAction,
        ]);

        expect(await driver.fileTreeRepo.find({notebookId})).toHaveLength(1);
        await driver.emitAsUser(eventBus, [addToTrashBinAction]);

        expect(await driver.fileTreeRepo.find({notebookId})).toHaveLength(0);
      });
    });

    describe('move folder to Trash Bin', () => {
      let rootFolderId: string;
      let createFolderAction: any;

      let notebooksIds: string[];
      let createNotebooksActions: any[];

      let subFolders: string[];
      let createSubFolderActions: any[];

      beforeEach(() => {
        notebooksIds = [];
        createNotebooksActions = [];
        subFolders = [];
        createSubFolderActions = [];

        [rootFolderId, createFolderAction] = mockBuilder.createFolderAction(
          `rootFolder`,
          [],
        );

        for (let i = 0; i < 3; i++) {
          [subFolders[i], createSubFolderActions[i]] =
            mockBuilder.createFolderAction(`subFolder${i}`, [
              {id: rootFolderId},
            ]);

          [notebooksIds[i], createNotebooksActions[i]] =
            mockBuilder.createNotebookAction([{id: subFolders[i]}]);
        }
      });

      it('moves all child notebooks to Trash Bin', async () => {
        await driver.emitAsUser(eventBus, [
          createFolderAction,
          ...createSubFolderActions,
          ...createNotebooksActions,
          TrashBinActions.moveFolderToTrashBin(rootFolderId),
        ]);

        await notebooksIds.forEach(async notebookId => {
          await driver.getNotebook(notebookId).and.expectToBeUndefined();
        });
      });

      it('deletes all sub folders', async () => {
        await driver.emitAsUser(eventBus, [
          createFolderAction,
          ...createSubFolderActions,
          ...createNotebooksActions,
          TrashBinActions.moveFolderToTrashBin(rootFolderId),
        ]);

        subFolders.forEach(async folderId => {
          const folder = await driver.folderRepo.findOne({id: folderId});
          expect(folder).toBeUndefined();
        });
      });

      it('deletes tree', async () => {
        await driver.emitAsUser(eventBus, [
          createFolderAction,
          ...createSubFolderActions,
          ...createNotebooksActions,
          TrashBinActions.moveFolderToTrashBin(rootFolderId),
        ]);

        [...subFolders, ...notebooksIds].forEach(async nodeId => {
          const node = await driver.fileTreeRepo.findOne({id: nodeId});
          expect(node).toBeUndefined();
        });
      });
    });

    it('restores notebook from Trash Bin', async () => {
      let rootFolderId: string;
      let createFolderAction: any;
      let notebookId: string;
      let createNotebookAction: any;

      [rootFolderId, createFolderAction] = mockBuilder.createFolderAction(
        'rootFolder',
        [],
      );

      [notebookId, createNotebookAction] = mockBuilder.createNotebookAction([
        {id: rootFolderId},
      ]);

      let addToTrashBinAction: IAction<TrashBinActions>;
      [notebookId, addToTrashBinAction] =
        mockBuilder.moveNotebookToTrashBinAction(undefined, notebookId);

      await driver.emitAsUser(eventBus, [
        createFolderAction,
        createNotebookAction,
        addToTrashBinAction,
      ]);

      let restoreFromTrashBinAction: IAction<TrashBinActions>;
      [notebookId, restoreFromTrashBinAction] =
        mockBuilder.restoreNotebookFromTrashBinAction(
          undefined,
          rootFolderId,
          notebookId,
        );
      await driver.emitAsUser(eventBus, [restoreFromTrashBinAction]);

      await driver.getNotebook(notebookId).and.expectToBeDefined();
      await driver.getDeletedNotebook(notebookId).and.expectToBeUndefined();

      const tree = await driver.getUserFileTree(defaultUser);
      const node = tree.find(n => n.notebookId === notebookId);

      expect(node).toBeDefined();
      expect(node?.parentId).toEqual(rootFolderId);
    });

    describe('permanently delete notebook', () => {
      let notebookId: string;
      let createNotebookAction: IAction<NotebookActions>;
      let permanentlyDeleteTrashBinAction: IAction<TrashBinActions>;
      let addToTrashBinAction: IAction<TrashBinActions>;

      beforeEach(() => {
        [notebookId, createNotebookAction] = mockBuilder.createNotebookAction();
        [notebookId, addToTrashBinAction] =
          mockBuilder.moveNotebookToTrashBinAction(undefined, notebookId);

        [notebookId, permanentlyDeleteTrashBinAction] =
          mockBuilder.permanentlyDeleteDeletedNotebookAction(
            undefined,
            notebookId,
          );
      });

      it('deletes the Deleted Notebook', async () => {
        await driver.emitAsUser(eventBus, [
          createNotebookAction,
          addToTrashBinAction,
          permanentlyDeleteTrashBinAction,
        ]);

        await driver.getDeletedNotebook(notebookId).and.expectToBeUndefined();
      });

      it('deletes notes of the notebook', async () => {
        await driver.emitAsUser(eventBus, []);

        await eventBus.emit([
          createNotebookAction,
          createNoteAction(notebookId),
          createNoteAction(notebookId),
          addToTrashBinAction,
          permanentlyDeleteTrashBinAction,
        ]);

        const notes = await driver.noteRepo.find({notebookId});
        expect(notes).toHaveLength(0);
      });
    });
  });

  describe('notebooks::', () => {
    let notebookId: string;
    let createNotebookAction: IAction<NotebookActions>;

    beforeEach(() => {
      [notebookId, createNotebookAction] = mockBuilder.createNotebookAction();
    });

    it('create notebook', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction]);
      const notebook = await driver
        .getNotebook(notebookId)
        .and.expectToBeDefined();

      expect(notebook.id).toBe(createNotebookAction.id);
    });

    it('set owner correctly', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction]);
      const notebook = await driver
        .getNotebook(notebookId)
        .and.expectToBeDefined();

      expect(notebook.owner).toBe(defaultUser);
    });

    it('update name', async () => {
      const note = createNote(notebookId);
      const addNoteAction = NoteActions.addNote(note.id, note);

      await driver.emitAsUser(eventBus, [
        createNotebookAction,
        addNoteAction,
        NotebookActions.updateName(notebookId, 'newName'),
      ]);

      const notebook = await driver
        .getNotebook(notebookId)
        .and.expectToBeDefined();

      expect(notebook.name).toBe('newName');
    });

    it('toggle isLiked', async () => {
      await driver.emitAsUser(eventBus, [
        createNotebookAction,
        NotebookActions.toggleIsLiked(notebookId, true),
      ]);

      await driver
        .getFavorite(defaultUser, notebookId, EntityType.Notebook)
        .and.expectToBeDefined();

      await driver.emitAsUser(eventBus, [
        NotebookActions.toggleIsLiked(notebookId, false),
      ]);

      await driver
        .getFavorite(defaultUser, notebookId, EntityType.Notebook)
        .and.expectToBeUndefined();
    });

    describe('delete', () => {
      it('deletes notebook and keep notes', async () => {
        await driver.emitAsUser(eventBus, [
          createNotebookAction,
          createNoteAction(notebookId),
          createNoteAction(notebookId),
          NotebookActions.deleteNotebook(notebookId),
        ]);

        await driver.getNotebook(notebookId).and.expectToBeUndefined();

        const notes = await driver.getNotesForNotebook(notebookId);
        expect(notes).toHaveLength(2);
      });

      it('delete notes', async () => {
        await driver.emitAsUser(eventBus, [
          createNotebookAction,
          createNoteAction(notebookId),
          createNoteAction(notebookId),
          NotebookActions.deleteNotebookNotes(notebookId),
        ]);

        await driver.getNotebook(notebookId).and.expectToBeDefined();

        const notes = await driver.getNotesForNotebook(notebookId);
        expect(notes).toHaveLength(0);
      });

      it('delete favorite after deleting the notebook', async () => {
        await driver.emitAsUser(eventBus, [
          createNotebookAction,
          NotebookActions.toggleIsLiked(notebookId, true),
        ]);

        await driver
          .getFavorite(defaultUser, notebookId, EntityType.Notebook)
          .and.expectToBeDefined();

        await driver.emitAsUser(eventBus, [
          NotebookActions.deleteNotebook(notebookId),
        ]);

        await driver
          .getFavorite(defaultUser, notebookId, EntityType.Notebook)
          .and.expectToBeUndefined();
      });

      it('delete only the favorite of the deleted notebook', async () => {
        const [id1, createAction1] = mockBuilder.createNotebookAction();
        const [id2, createAction2] = mockBuilder.createNotebookAction();

        await eventBus.emit([createAction1, createAction2]);

        await driver.emitAsUser(eventBus, [
          NotebookActions.toggleIsLiked(id1, true),
          NotebookActions.toggleIsLiked(id2, true),
        ]);

        await driver.emitAsUser(eventBus, [
          NotebookActions.deleteNotebook(id1),
        ]);

        await driver
          .getFavorite(defaultUser, id1, EntityType.Notebook)
          .and.expectToBeUndefined();

        await driver
          .getFavorite(defaultUser, id2, EntityType.Notebook)
          .and.expectToBeDefined();
      });
    });
  });

  describe('notes::', () => {
    let notebookId: string;
    let createNotebookAction: NotebookActions;
    let addNoteAction: NoteActionT<'note.create'>;
    let note: INote;

    beforeEach(() => {
      [notebookId, createNotebookAction] = mockBuilder.createNotebookAction();
      note = createNote(notebookId);
      addNoteAction = NoteActions.addNote(note.id, note);
    });

    it('create note', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction]);
      await driver.emitAsUser(eventBus, [addNoteAction]);

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
    });

    it('create note, with content', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction]);
      addNoteAction = NoteActions.addNote(
        note.id,
        createNote(notebookId, {content: 'bla bla bla'}),
      );
      await driver.emitAsUser(eventBus, [addNoteAction]);

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
      expect(notebook.notes![0].textContent).toBe('bla bla bla');
    });

    it('create note with bulk actions', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
      const {id, name, notebookId: parent, type} = note;
      expect(notebook.notes![0]).toMatchObject(
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

      expect(notebook.notes![0].name).toBe('changedName');
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

      expect(notebook.notes![0].textContent).toBe('select foo from bar');
    });

    describe('note update', () => {
      beforeEach(async () => {
        await driver.emitAsUser(eventBus, [
          createNotebookAction,
          addNoteAction,
        ]);
      });

      it.each([
        ['content', () => NoteActions.updateContent(note.id, 'content')],
        [
          'richContent',
          () => NoteActions.updateContent(note.id, '\n', {rich: 'content'}),
        ],
        ['name', () => NoteActions.updateName(note.id, 'name')],
      ])(
        'should not update %s when there are no changes',
        async (_text, createAction) => {
          const action = createAction();

          await driver.emitAsUser(eventBus, [action]);
          const firstNote = await driver.getNote(note.id);

          await new Promise(resolve => setTimeout(resolve, 1000));

          await driver.emitAsUser(eventBus, [action]);
          const secondNote = await driver.getNote(note.id);

          expect(firstNote?.dateUpdated).toBe(secondNote?.dateUpdated);
        },
      );

      it.each([
        [
          'content',
          () => NoteActions.updateContent(note.id, 'content'),
          () => NoteActions.updateContent(note.id, 'different'),
        ],
        [
          'richContent',
          () => NoteActions.updateContent(note.id, '\n', {rich: 'content'}),
          () => NoteActions.updateContent(note.id, '\n', {content: 'rich'}),
        ],
        [
          'name',
          () => NoteActions.updateContent(note.id, 'name'),
          () => NoteActions.updateContent(note.id, 'different'),
        ],
      ])(
        'should update %s when there are changes',
        async (_text, createFirstAction, createSecondAction) => {
          await driver.emitAsUser(eventBus, [createFirstAction()]);

          const firstNote = await driver.getNote(note.id);

          await new Promise(resolve => setTimeout(resolve, 1000));

          await driver.emitAsUser(eventBus, [createSecondAction()]);

          const secondNote = await driver.getNote(note.id);

          expect(secondNote?.dateUpdated).toBeGreaterThan(
            firstNote!.dateUpdated,
          );
        },
      );
    });

    it('move note between notebook', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);
      const [secondNotebookId, createNotebookAction2] =
        mockBuilder.createNotebookAction();

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
        const [notebookId2, createNotebookAction2] =
          mockBuilder.createNotebookAction();

        const notes2 = range(2).map(() => createNote(notebookId2));

        notes = range(howManyNotes).map(() => createNote(notebookId));
        createNoteActions = notes.map(n => NoteActions.addNote(n.id, n));
        const createNoteActions2 = notes2.map(n =>
          NoteActions.addNote(n.id, n),
        );

        /* creating notes in another notebook, just to make sure reorder is local inside a notebook */
        await driver.emitAsUser(eventBus, [createNotebookAction2]);
        await driver.emitAsUser(eventBus, createNoteActions2);

        await driver.emitAsUser(eventBus, [createNotebookAction]);
        await driver.emitAsUser(eventBus, createNoteActions);
      });

      it('should create new notes with correct order', async () => {
        const notebook = await driver.getNotebookWithNotes(notebookId);
        const doesRankMatchInsertOrder = notes.every(
          (note, index) =>
            notebook.notes!.find(n => n.id === note.id)!.rank === index,
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
              notebook.notes!.find(n => n.id === note.id)!.rank === index,
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

          const reorderedNotes = reorderPos(notes, from, to);
          const notebook = await driver.getNotebookWithNotes(notebookId);

          const doesRankMatchInsertOrder = reorderedNotes.every(
            (note, index) =>
              notebook.notes!.find(n => n.id === note.id)!.rank === index,
          );

          expect(doesRankMatchInsertOrder).toBeTruthy();
        });
      });
    });
  });

  describe('folder tree::', () => {
    let rootFolderId: string;
    let createRootFolderAction: any;
    let notebookId: string;
    let createNotebookAction: any;

    beforeEach(() => {
      [rootFolderId, createRootFolderAction] = mockBuilder.createFolderAction(
        'rootFolder',
        [],
      );

      [notebookId, createNotebookAction] = mockBuilder.createNotebookAction([
        {id: rootFolderId},
      ]);
    });

    it('a single folder', async () => {
      await driver.emitAsUser(eventBus, [createRootFolderAction]);

      const list = await driver.getUserFileTree(defaultUser);
      expect(list[0].folder!.name).toBe('rootFolder');
    });

    it('rename folder', async () => {
      await driver.emitAsUser(eventBus, [createRootFolderAction]);
      await driver.emitAsUser(eventBus, [
        FileActions.updateName(rootFolderId, 'a changedName'),
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      expect(list[0].folder!.name).toBe('a changedName');
    });

    it('a notebook inside a single folder', async () => {
      await driver.emitAsUser(eventBus, [
        createRootFolderAction,
        createNotebookAction,
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      const notebookTreeItem = list.find(
        item => item.id === notebookId && item.parentId === rootFolderId,
      );
      expect(notebookTreeItem).toBeDefined();
    });

    it('have multiple notebooks inside a single folder', async () => {
      const [notebookId2, createNotebookAction2] =
        mockBuilder.createNotebookAction([{id: rootFolderId}]);
      await driver.emitAsUser(eventBus, [
        createRootFolderAction,
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
      const [subFolder1, createSubFolder1] = mockBuilder.createFolderAction(
        'subFolder1',
        [{id: rootFolderId}],
      );

      await driver.emitAsUser(eventBus, [
        createRootFolderAction,
        createSubFolder1,
        createNotebookAction,
      ]);

      await driver.emitAsUser(eventBus, [
        NotebookActions.moveNotebook(notebookId, [{id: subFolder1, name: ''}]),
      ]);

      const list = await driver.getUserFileTree(defaultUser);
      const notebook = list.find(item => item.id === notebookId);
      expect(notebook!.mpath).toBe(
        `${rootFolderId}.${subFolder1}.${notebookId}`,
      );
    });

    it('folder tree move', async () => {
      const [subFolder1, createSubFolder1] = mockBuilder.createFolderAction(
        'subFolder1',
        [{id: rootFolderId}],
      );

      const [subFolder2, createSubFolder2] = mockBuilder.createFolderAction(
        'subFolder2',
        [{id: subFolder1}],
      );

      const [subFolder3, createSubFolder3] = mockBuilder.createFolderAction(
        'subFolder3',
        [{id: rootFolderId}],
      );

      const [notebookId, createNotebookAction] =
        mockBuilder.createNotebookAction([{id: subFolder2}]);

      await driver.emitAsUser(eventBus, [
        createRootFolderAction,
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
        mpath: [
          rootFolderId,
          subFolder3,
          subFolder1,
          subFolder2,
          notebookId,
        ].join('.'),
      });
      expect(find(list, {id: subFolder2})).toMatchObject({
        mpath: [rootFolderId, subFolder3, subFolder1, subFolder2].join('.'),
      });
    });

    it('delete an empty folder', async () => {
      const [subFolder1, createSubFolder1] = mockBuilder.createFolderAction(
        'subFolder1',
        [{id: rootFolderId}],
      );

      await driver.emitAsUser(eventBus, [
        createRootFolderAction,
        createSubFolder1,
      ]);
      const beforeList = await driver.getUserFileTree(defaultUser);
      expect(beforeList).toHaveLength(2);

      await driver.emitAsUser(eventBus, [FileActions.deleteFile(subFolder1)]);

      const afterList = await driver.getUserFileTree(defaultUser);
      expect(afterList).toMatchObject([
        expect.objectContaining({id: rootFolderId}),
      ]);
    });

    it('delete notebook favorite after deleting the parent folder', async () => {
      const [subFolderId, createSubFolder] = mockBuilder.createFolderAction(
        'subFolder',
        [{id: rootFolderId}],
      );

      const [notebookId, createNotebookAction] =
        mockBuilder.createNotebookAction([{id: subFolderId}]);

      await driver.emitAsUser(eventBus, [
        createRootFolderAction,
        createSubFolder,
        createNotebookAction,
      ]);

      await driver.emitAsUser(eventBus, [
        NotebookActions.toggleIsLiked(notebookId, true),
      ]);

      await driver.emitAsUser(eventBus, [FileActions.deleteFile(subFolderId)]);

      await driver
        .getFavorite(defaultUser, notebookId, EntityType.Notebook)
        .and.expectToBeUndefined();
    });
  });

  describe('user list::', () => {
    it('should add user with dateCreated in the past', async () => {
      const createAction = UserActions.createNewUser('foo', {
        avatar: '',
        dateCreated: 1000,
        dateUpdated: 1000,
        email: 'foo',
        id: 'foo',
        name: '',
        rootFolder: '',
      });
      await driver.emitAsUser(eventBus, [createAction], 'foo');
      const users = await driver.getUsers();
      expect(users[0]).toMatchObject({dateCreated: 1000, dateUpdated: 1000});
    });
  });

  describe('error handling::', () => {
    it('should throw an error on invalid action', async () => {
      const error = await driver
        .emitAsUser(eventBus, [{type: 'foo'}])
        .catch(e => e);
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(error instanceof Error).toBe(true);
    });
  });
});

function reorderPos<T>(items: T[], from: number, to: number) {
  const clone = items.slice();
  const [item] = clone.splice(from, 1);
  clone.splice(to, 0, item);

  return clone;
}
