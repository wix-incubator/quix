export {addNotebook} from './notebook';
export {addFolder, isRoot, goToFile} from './files';
export {confirm} from './dialog';
export {StateManager} from './state';

export {
  IPermissions,
  isOwner,
  getDefaultPermissions,
  getFolderPermissions,
  getNotebookPermissions
} from './permissions';