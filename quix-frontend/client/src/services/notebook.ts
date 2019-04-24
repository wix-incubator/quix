import {isArray} from 'lodash';
import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {IFolder, INotebook, INote, NotebookActions, createNotebook, NoteActions, IFilePathItem, createNote} from '../../../shared';
import {FileType} from '../../../shared/entities/file';
import {fetchRootPath, goUp, goToFile} from './files';

const resolvePath = async (parentOrPath: IFolder | IFilePathItem[]) => {
  const path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  return path.length ? path : [await fetchRootPath()];
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

export const copyNotebook = async (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], notebook: INotebook) => {
  const {name, notes} = notebook;
  const path = await resolvePath(parentOrPath);

  const newNotebook = createNotebook(path, {
    name: `Copy of ${name}`,
    owner: app.getUser().getEmail()
  });

  store.dispatchAndLog([
    NotebookActions.createNotebook(newNotebook.id, newNotebook),
    ...notes.map(({name: noteName, type, content, owner}) => {
      const note = createNote(newNotebook.id, {name: noteName, type, content, owner} as any);
      return NoteActions.addNote(note.id, note);
    })
  ])
  .then(() => goToFile(app, {...newNotebook, type: FileType.notebook}, {isNew: false}));
}

export const deleteNotebook = async (store: Store, app: Instance, notebook: INotebook) => {
  const {id} = notebook;

  store.dispatchAndLog(NotebookActions.deleteNotebook(id)).then(() => goUp(app, notebook));
}

export const saveQueuedNotes = (store: Store) => {
  const {notes} = store.getState('notebook.queue') as {notes: Record<string, INote>};

  return store.dispatchAndLog(Object.keys(notes).map(id => NoteActions.updateContent(id, notes[id].content)));
}

export const hasQueuedNotes = (store: Store) => {
  return store.getState('notebook.queue.size') > 0;
}