import {takeWhile} from 'lodash';
import {Store} from '../../lib/store';
import {utils} from '../../lib/core';
import {toast} from '../../lib/ui';
import {App} from '../../lib/app';
import {IScope} from './files-types';
import {IFile, FileActions, NotebookActions, FileType, IFilePathItem} from '@wix/quix-shared';
import {addNotebook, goToNotebook} from '../../services/notebook';
import {addFolder, deleteFolder, goToFile, goToRoot} from '../../services/files';
import {setFolder, toggleMark, unmarkAll} from '../../store/folder/folder-actions';

export const onNameChange = (scope: IScope, store: Store, app: App) => (folder: IFile) => {
  const {id, name} = folder;

  store.dispatchAndLog(FileActions.updateName(id, name));
};

export const onChildNameChange = (scope: IScope, store: Store, app: App) => (file: IFile) => {
  onNameChange(scope, store, app)(file);
};

export const onDelete = (scope: IScope, store: Store, app: App) => (folder: IFile) => {
  deleteFolder(store, app, folder)
   .then(() => toast.showToast({
      text: `Deleted folder "${folder.name}"`,
      type: 'success'
    }, 3000));
};

export const onShare = (scope: IScope, store: Store, app: App) => (folder: IFile) => {
  const {id} = folder;

  utils.copyToClipboard(app.getNavigator().getUrl(null, {id}));

  toast.showToast({
    text: 'Copied folder url to clipboard',
    type: 'success'
  }, 3000);
}

export const onLikeToggle = (scope: IScope, store: Store, app: App) => (file: IFile) => {
  const {id, isLiked} = file;

  store.dispatchAndLog(file.type === FileType.folder ? FileActions.toggleIsLiked(id, !isLiked) : NotebookActions.toggleIsLiked(id, !isLiked));
}

export const onBreadcrumbClick = (scope: IScope, store: Store, app: App) => (file: IFilePathItem) => {
  const {folder: {owner, path}} = scope.vm.state.value();

  goToFile(app, {...file, owner, type: FileType.folder, path: takeWhile(path, item => item.id !== file.id)});
};

export const onFileClick = (scope: IScope, store: Store, app: App) => (file: IFile) => {
  goToFile(app, file);
};

export const onGoToRootClick = (scope: IScope, store: Store, app: App) => () => {
  goToRoot(app);
};

export const onFolderAdd = (scope: IScope, store: Store, app: App) => () => {
  const {folder} = scope.vm.state.value();
  
  addFolder(store, app, folder)
    .then(newFolder => scope.vm.files.get(newFolder).isNew = true);
};

export const onNotebookAdd = (scope: IScope, store: Store, app: App) => () => {
  const {folder} = scope.vm.state.value();

  addNotebook(store, app, folder, {addNote: true})
    .then(notebook => goToNotebook(app, notebook, {isNew: true}));
};

export const onMarkToggle = (scope: IScope, store: Store, app: App) => (file: IFile) => {
  store.dispatch(toggleMark(file));
};

export const onUnmarkAll = (scope: IScope, store: Store, app: App) => () => {
  store.dispatch(unmarkAll());
};

export const onMarkedDelete = (scope: IScope, store: Store, app: App) => (files: IFile[]) => {
  store.dispatchAndLog(files.map(file => file.type === 'folder' ? 
    FileActions.deleteFile(file.id) : NotebookActions.deleteNotebook(file.id)))
    .then(() => toast.showToast({
      text: `Deleted ${files.length} items`,
      type: 'success'
    }, 3000));
}

export const $onDestroy = (scope: IScope, store: Store, app: App) => () => {
  store.dispatch(setFolder(null));
}
