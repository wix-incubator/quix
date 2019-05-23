import {isArray} from 'lodash';
import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {IFolder, INotebook, INote, NotebookActions, createNotebook, NoteActions, IFilePathItem, createNote, IPrestoNote} from '../../../shared';
import {FileType} from '../../../shared/entities/file';
import {fetchRootPath, goUp, goToFile} from './';

const resolvePath = async (parentOrPath: IFolder | IFilePathItem[]) => {
  const path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  return path.length ? path : fetchRootPath();
}

export const addNotebook = async (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], props: Partial<INotebook> = {}) => {
  const path = await resolvePath(parentOrPath);
  const notebook = createNotebook(path, {...props, owner: app.getUser().getEmail()});
  const note = createNote(notebook.id);

  store.dispatchAndLog([
    NotebookActions.createNotebook(notebook.id, notebook),
    NoteActions.addNote(note.id, note)
  ])
  .then(() => goToFile(app, {...notebook, type: FileType.notebook}, {isNew: true}));
}

export const copyNotebook = async (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], sourceNotebook: INotebook) => {
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

export const copyNote = async (store: Store, app: Instance, targetNotebook: INotebook, sourceNote: INote) => {
  const {name, content, type} = sourceNote as IPrestoNote;

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

export const deleteNotebook = async (store: Store, app: Instance, notebook: INotebook) => {
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

export const goToExamples = (app: Instance) => {
  app.go('notebook', {
    id: 'examples',
    isNew: false
  });
}