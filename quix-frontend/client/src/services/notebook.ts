import {isArray} from 'lodash';
import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {IFolder, INotebook, INote, NotebookActions, createNotebook, NoteActions, IFilePathItem} from '../../../shared';
import {FileType} from '../../../shared/entities/file';
import {fetchRootPathItem, goUp, goToFile} from './files';

export const addNotebook = async (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], props: Partial<INotebook> = {}) => {
  let path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  path = path.length ? path : [await fetchRootPathItem()];

  const notebook = createNotebook(path, {...props, owner: app.getUser().getEmail()});

  store.dispatchAndLog([
    NotebookActions.createNotebook(notebook.id, notebook),
    NoteActions.addNote(notebook.id)
  ])
  .then(() => goToFile(app, {...notebook, type: FileType.notebook}, {isNew: true}));
}

export const deleteNotebook = async (store: Store, app: Instance, notebook: INotebook) => {
  const {id} = notebook;

  store.dispatchAndLog(NotebookActions.deleteNotebook(id)).then(() => goUp(app, notebook));
}

export const saveQueuedNotes = (store: Store) => {
  const {notes} = store.getState('notebook').queue as {notes: Record<string, INote>};

  return store.dispatchAndLog(Object.keys(notes).map(id => NoteActions.updateContent(id, notes[id].content)));
}