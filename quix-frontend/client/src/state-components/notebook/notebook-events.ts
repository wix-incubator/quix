import {last} from 'lodash';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {INote, NotebookActions, IFile, NoteActions, INotebook} from '../../../../shared';
import {IScope} from './notebook-types';
import {setNotebook, queueNote, toggleMark, unmarkAll} from '../../store/notebook/notebook-actions';
import {saveQueuedNotes} from '../../services/notebook';
import {removeRunner, addRunner} from '../../store/app/app-actions';
import {prompt} from '../../services/dialog';

export const onFolderClick = (scope: IScope, store: Store, app: Instance) => (folder: IFile = null) => {
  app.getNavigator().go('base.files', {id: folder && folder.id, isNew: false});
}

export const onNameChange = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  const {id, name} = file;

  store.dispatchAndLog(NotebookActions.updateName(id, name));
}

export const onDelete = (scope: IScope, store: Store, app: Instance) => (notebook: INotebook) => {
  const {id, path} = notebook;

  store.dispatchAndLog(NotebookActions.deleteNotebook(id))
    .then(() => app.getNavigator().go('base.files', {
      id: path.length ? last<any>(path).id : undefined,
      isNew: false
    }));
}

export const onCopy = (scope: IScope, store: Store, app: Instance) => () => {
  // const {id, path} = notebook;

  prompt({title: 'Copy notebook', yes: 'copy', content: `
    Coming soon...
  `}, scope);
}

export const onMarkedNotesDelete = (scope: IScope, store: Store, app: Instance) => (notes: INote[]) => {
  store.dispatchAndLog(notes.map(note => NoteActions.deleteNote(note.id)));
}

export const onMarkedNotesCopy = (scope: IScope, store: Store, app: Instance) => () => {
    prompt({title: 'Copy notes', yes: 'copy', content: `
    Coming soon...
  `}, scope);
}

export const onLikeToggle = (scope: IScope, store: Store, app: Instance) => (notebook: INotebook) => {
  const {id, isLiked} = notebook;

  store.dispatchAndLog(NotebookActions.toggleIsLiked(id, !isLiked));
}

export const onSave = (scope: IScope, store: Store, app: Instance) => () => {
  saveQueuedNotes(store);
}

export const onRun = (scope: IScope, store: Store, app: Instance) => () => {
  saveQueuedNotes(store);
}

export const onNoteSave = (scope: IScope, store: Store, app: Instance) => () => {
  saveQueuedNotes(store);
}

export const onNoteRun = (scope: IScope, store: Store, app: Instance) => () => {
  saveQueuedNotes(store);
}

export const onNoteAdd = (scope: IScope, store: Store, app: Instance) => () => {
  const {notebook} = scope.vm.state.value();
  const {id} = notebook;
  const {note} = store.dispatchAndLog(NoteActions.addNote(id)) as any;
  
  const vm = scope.vm.notes.get(note);
  vm.fold = false;
  vm.focusName = true;
}

export const onNoteDelete = (scope: IScope, store: Store, app: Instance) => (note: INote) => {
  store.dispatchAndLog(NoteActions.deleteNote(note.id));
}

export const onNoteContentChange = (scope: IScope, store: Store, app: Instance) => (note: INote) => {
  store.dispatch(queueNote(note));
}

export const onNoteNameChange = (scope: IScope, store: Store, app: Instance) => (note: INote) => {
  store.dispatchAndLog(NoteActions.updateName(note.id, note.name));
}

export const onMarkToggle = (scope: IScope, store: Store, app: Instance) => (note: INote) => {
  store.dispatch(toggleMark(note));
};

export const onUnmarkAll = (scope: IScope, store: Store, app: Instance) => () => {
  store.dispatch(unmarkAll());
};

export const onRunnerCreated = (scope: IScope, store: Store) => (note, runner) => {
  store.dispatch(addRunner(note.id, runner));
};

export const onRunnerDestroyed = (scope: IScope, store: Store) => (note) => {
  store.dispatch(removeRunner(note.id));
};

export const $onDestroy = (scope: IScope, store: Store, app: Instance) => () => {
  saveQueuedNotes(store);
  store.dispatch(setNotebook(null));
}
