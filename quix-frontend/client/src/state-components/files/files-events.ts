import {Store} from '../../lib/store';
import {utils} from '../../lib/core';
import {toast} from '../../lib/ui';
import {Instance} from '../../lib/app';
import {IScope} from './files-types';
import {IFile, FileActions, NotebookActions} from '../../../../shared';
import {addNotebook} from '../../services/notebook';
import {addFolder, deleteFolder} from '../../services/files';
import {FileType} from '../../../../shared/entities/file';
import {toggleMark, unmarkAll, setFile} from '../../store/files/files-actions';

export const onNameChange = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  const {id, name} = file;

  store.dispatchAndLog(FileActions.updateName(id, name));
};

export const onDelete = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  deleteFolder(store, app, file);
};

export const onShare = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  utils.copyToClipboard(app.getNavigator().getUrl(null, {id: file.id}));

  toast.showToast({
    text: 'Copied folder url to clipboard',
    hideDelay: 3000
  });
}

export const onMarkedDelete = (scope: IScope, store: Store, app: Instance) => (files: IFile[]) => {
  store.dispatchAndLog(files.map(file => file.type === 'folder' ? 
    FileActions.deleteFile(file.id) 
    : NotebookActions.deleteNotebook(file.id)));
}

export const onLikeToggle = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  const {id, isLiked} = file;

  store.dispatchAndLog(file.type === 'folder' ? FileActions.toggleIsLiked(id, !isLiked) : NotebookActions.toggleIsLiked(id, !isLiked));
}

export const onFileClick = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  app.getNavigator().go(`base.${file && file.type === FileType.notebook ? 'notebook' : 'files'}`, {
    id: file && file.id,
    isNew: false
  });
};

export const onFolderAdd = (scope: IScope, store: Store, app: Instance) => () => {
  const {file} = scope.vm.state.value();
  const {id, name, path} = file || {id: null, name: null, path: null};

  addFolder(store, app, id ? [...path, {id, name}] : []);
};

export const onNotebookAdd = (scope: IScope, store: Store, app: Instance) => () => {
  const {file} = scope.vm.state.value();
  const {id, name, path} = file || {id: null, name: null, path: null};

  addNotebook(store, app, id ? [...path, {id, name}] : []);
};

export const onMarkToggle = (scope: IScope, store: Store, app: Instance) => (file: IFile) => {
  store.dispatch(toggleMark(file));
};

export const onUnmarkAll = (scope: IScope, store: Store, app: Instance) => () => {
  store.dispatch(unmarkAll());
};

export const $onDestroy = (scope: IScope, store: Store, app: Instance) => () => {
  store.dispatch(setFile(null));
}
