import {takeWhile} from 'lodash';
import {utils} from '../../lib/core';
import {Store} from '../../lib/store';
import {toast} from '../../lib/ui';
import {Instance} from '../../lib/app';
import {INote, NotebookActions, IFile, NoteActions, INotebook, IFilePathItem} from '../../../../shared';
import {FileType} from '../../../../shared/entities/file';
import {IScope} from './notebook-types';
import {setNotebook, setNote, queueNote, toggleMark, unmarkAll} from '../../store/notebook/notebook-actions';
import {saveQueuedNotes, deleteNotebook} from '../../services/notebook';
import {removeRunner, addRunner} from '../../store/app/app-actions';
import {prompt} from '../../services/dialog';
import {goToFile, goToRoot} from '../../services/files';

export const onBreadcrumbClick = (scope: IScope, store: Store, app: Instance) => (file: IFilePathItem) => {
  const {notebook: {owner, path}} = scope.vm.state.value();

  goToFile(app, {...file, owner, type: FileType.folder, path: takeWhile(path, item => item.id !== file.id)});
};

export const onGoToRootClick = (scope: IScope, store: Store, app: Instance) => () => {
  goToRoot(app);
};

export const onNameChange = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  const {id, name} = file;

  store.dispatchAndLog(NotebookActions.updateName(id, name));
}

export const onDelete = (scope: IScope, store: Store, app: Instance) => (notebook: INotebook) => {
  deleteNotebook(store, app, notebook);
}

export const onCopy = (scope: IScope, store: Store, app: Instance) => () => {
  // const {id, path} = notebook;

  prompt({title: 'Copy notebook', yes: 'copy', content: `
    Coming soon...
  `}, scope);
}

export const onShare = (scope: IScope, store: Store, app: Instance) => (notebook: INotebook) => {
  utils.copyToClipboard(app.getNavigator().getUrl(null, {id: notebook.id}));

  toast.showToast({
    text: 'Copied notebook url to clipboard',
    type: 'success'
  }, 3000);
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

  store.dispatch(setNote(note));
  
  const vm = scope.vm.notes.get(note);
  vm.focusName = true;
}

export const onNoteShare = (scope: IScope, store: Store, app: Instance) => (note: INote) => {
  const {notebook} = scope.vm.state.value();

  utils.copyToClipboard(app.getNavigator().getUrl(null, {id: notebook.id, note: note.id}));

  toast.showToast({
    text: 'Copied note url to clipboard',
    type: 'success'
  }, 3000);
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
