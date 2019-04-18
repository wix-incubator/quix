import {isArray} from 'lodash';
import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {IFolder, INotebook, INote, NotebookActions, createNotebook, NoteActions, IFilePathItem} from '../../../shared';

export const addNotebook = (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], props: Partial<INotebook> = {}) => {
  const path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  const notebook = createNotebook(path, {...props, owner: app.getUser().getEmail()});

  store.dispatchAndLog([
    NotebookActions.createNotebook(notebook.id, notebook),
    NoteActions.addNote(notebook.id)
  ])
  .then(() => app.getNavigator().go('base.notebook', {id: notebook.id, isNew: true}));
}

export const saveQueuedNotes = (store: Store) => {
  const {notes} = store.getState('notebook').queue as {notes: Record<string, INote>};

  return store.dispatchAndLog(Object.keys(notes).map(id => NoteActions.updateContent(id, notes[id].content)));
}