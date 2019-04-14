import {TestingModule} from '@nestjs/testing';
import 'reflect-metadata';
import {INote, NoteActions} from '../../../../shared/entities/note';
import {NoteActionT} from '../../../../shared/entities/note/actions';
import {NotebookActions} from '../../../../shared/entities/notebook';
import {QuixEventBus} from './quix-event-bus';
import {QuixEventBusDriver} from './quix-event-bus.driver';
jest.setTimeout(30000);

describe('event sourcing', () => {
  let driver: QuixEventBusDriver;

  let eventBus: QuixEventBus;
  let module: TestingModule;
  // let notebookRepo: Repository<DbNotebook>;
  // let noteRepo: Repository<DbNote>;

  beforeAll(async () => {
    driver = await QuixEventBusDriver.create();
    ({eventBus, module} = await driver);
  });

  beforeEach(() => driver.clearDb());
  afterAll(() => driver.clearDb());

  afterAll(() => module.close());

  describe('notebooks', () => {
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
      await driver.emitAsUser(eventBus, [createAction], 'someUser');
      const notebook = await driver.getNotebook(id).and.expectToBeDefined();

      expect(notebook.owner).toBe('someUser');
    });

    it('update name', async () => {
      await driver.emitAsUser(eventBus, [
        createAction,
        NotebookActions.updateName(id, 'newName'),
      ]);

      const notebook = await driver.getNotebook(id).and.expectToBeDefined();

      expect(notebook.name).toBe('newName');
    });

    // it('update isLiked', async () => {
    //   await driver.emitAsUser(eventBus, [
    //     createAction,
    //     NotebookActions.toggleIsLiked(id, true),
    //   ]);
    //   const notebook = await driver.getNotebook(id).and.expectToBeDefined();

    //   expect(notebook.isLiked).toBe(true);
    // });

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
      addNoteAction = NoteActions.addNote(notebookId);
      note = addNoteAction.note;
    });

    it('create note', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction]);
      await driver.emitAsUser(eventBus, [addNoteAction]);

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
    });

    it('create note with bulk actions', async () => {
      await driver.emitAsUser(
        eventBus,
        [createNotebookAction, addNoteAction],
        'someUser',
      );

      const notebook = await driver.getNotebookWithNotes(notebookId);

      expect(notebook.notes).toHaveLength(1);
      const {id, name, notebookId: parent, type} = note;
      expect(notebook.notes[0]).toMatchObject(
        expect.objectContaining({
          id,
          name,
          notebookId: parent,
          owner: 'someUser',
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

    it('move notebook', async () => {
      await driver.emitAsUser(eventBus, [createNotebookAction, addNoteAction]);
      const [
        secondNotebookId,
        createNotebookActions2,
      ] = driver.createNotebookAction();

      await driver.emitAsUser(eventBus, [createNotebookActions2]);

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
  });

  describe('folder tree::', () => {
    it('a single folder', async () => {
      const [id, createFolderAction] = driver.createFolderAction(
        'newFolder',
        [],
        'someUser',
      );

      await driver.emitAsUser(eventBus, [createFolderAction], 'someUser');

      // const tree = await driver.getFolderTree('someUser');
      // expect(tree!.folder!.name).toBe('newFolder');
    });

    it('a notebook inside a single folder', async () => {
      const [id, createFolderAction] = driver.createFolderAction(
        'newFolder',
        [],
        'someUser',
      );

      const [notebookId, createNotebookAction] = driver.createNotebookAction(
        'someUser',
        [{id, name: 'doesnt matter'}],
      );
      await driver.emitAsUser(
        eventBus,
        [createFolderAction, createNotebookAction],
        'someUser',
      );

      const list = await driver.getFolderDecendents('someUser');
      const notebookTreeItem = list.find(
        item => item.id === notebookId && item.parentId === id,
      );
      expect(notebookTreeItem).toBeDefined();
    });
  });
});
