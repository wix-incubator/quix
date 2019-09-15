import {isArray} from 'lodash';
import {Store} from '../lib/store';
import {App} from '../lib/app';
import {INotebook, INote, NotebookActions, createNotebook, NoteActions, IFilePathItem, createNote} from '@wix/quix-shared';
import {FileType, IFile} from '@wix/quix-shared/dist/entities/file';
import {fetchRootPath, goUp, goToFile} from './';
import { createFileByNamePath as addFileByNamePath } from './files';

const resolvePath = async (parentOrPath: IFile | IFilePathItem[]) => {
  const path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  return path.length ? path : fetchRootPath();
}

export const addNotebook = async (
  store: Store,
  app: App,
  parentOrPath: IFile | IFilePathItem[],
  options: {addNote: boolean},
  props: Partial<INotebook> = {}
): Promise<INotebook> => {
  const path = await resolvePath(parentOrPath);
  const notebook = createNotebook(path, {...props, owner: app.getUser().getEmail()});
  const actions: any[] = [NotebookActions.createNotebook(notebook.id, notebook)];

  if (options.addNote) {
    const note = createNote(notebook.id);
    actions.push(NoteActions.addNote(note.id, note));
  }

  return store.dispatchAndLog(actions).then(() => notebook);
}

export const addNote = async (
  store: Store,
  notebookId: string,
  type: string,
  props: Partial<INote> = {},
  onCreate?: (note: INote) => void,
): Promise<INote> => {
  const note = createNote(notebookId, {...props, type});

  if (onCreate) {
    onCreate(note);
  }
  
  return store.dispatchAndLog(NoteActions.addNote(note.id, note))
    .then(() => note);
}

export const addNotebookByNamePath = async (store: Store, app: App, namePath: string[]): Promise<INotebook> => {
  return addFileByNamePath<INotebook>(
    store,
    app,
    namePath,
    (name, parent) => addNotebook(store, app, parent, {addNote: false}, {name})
  );
}

export const copyNotebook = async (store: Store, app: App, parentOrPath: IFile | IFilePathItem[], sourceNotebook: INotebook) => {
  const {name, notes} = sourceNotebook;
  const path = await resolvePath(parentOrPath);

  const newNotebook = createNotebook(path, {
    name: `Copy of ${name}`,
    owner: app.getUser().getEmail()
  });

  return store.logAndDispatch([
    NotebookActions.createNotebook(newNotebook.id, newNotebook),
    ...notes.map(({name: noteName, type, content, owner}) => {
      const note = createNote(newNotebook.id, {name: noteName, type, content, owner} as any);
      return NoteActions.addNote(note.id, note);
    })
  ])
    .then(() => goToFile(app, {...newNotebook, type: FileType.notebook}, {isNew: false}))
    .then(() => newNotebook);
}

export const copyNote = async (store: Store, app: App, targetNotebook: INotebook, sourceNote: INote) => {
  const {name, content, type} = sourceNote;

  const newNote = createNote(targetNotebook.id, {
    name: `Copy of ${name}`,
    type,
    content,
    owner: app.getUser().getEmail()
  });

  return store.logAndDispatch([NoteActions.addNote(newNote.id, newNote)])
    .then(() => goToFile(app, {...targetNotebook, type: FileType.notebook}, {isNew: false, note: newNote.id}))
    .then(() => newNote);
}

export const deleteNotebook = async (store: Store, app: App, notebook: INotebook) => {
  const {id} = notebook;

  store.dispatchAndLog(NotebookActions.deleteNotebook(id)).then(() => goUp(app, notebook));
}

export const saveQueuedNotes = (store: Store) => {
  const {notes} = store.getState('notebook.queue') as {notes: Record<string, INote>};

  return store.logAndDispatch(Object.keys(notes).map(id => NoteActions.updateContent(id, notes[id].content)));
}

export const hasQueuedNotes = (store: Store) => {
  return store.getState('notebook.queue.size') > 0;
}

export const goToNotebook = (
  app: App,
  notebook: INotebook,
  params?: {isNew?: boolean; note?: string},
  options?: any,
) => {
  return goToFile(app, {...notebook, type: FileType.notebook}, params, options);
}

export const goToExamples = (app: App) => {
  app.go('notebook', {
    id: 'examples',
    isNew: false
  });
}