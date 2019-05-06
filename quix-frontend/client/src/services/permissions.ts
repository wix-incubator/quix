import {Instance} from '../lib/app';
import {IEntity, IFile} from '../../../shared';
import {isRoot} from './files';

export interface IPermissions {
  edit?: boolean;
  delete?: boolean;
  rename?: boolean;
  clone?: boolean;
  bulk?: IPermissions;
}

export interface IFolderPermissions extends IPermissions{
  addFolder?: boolean;
  addNotebook?: boolean;
}

export interface INotebookPermissions extends IPermissions{
  addNote?: boolean;
  bulk?: INotebookPermissions & {
    reorder?: boolean;
  };
}

export const isOwner = (app: Instance, entity: Pick<IEntity, 'owner'>) => {
  return entity.owner === app.getUser().getEmail();
}

export const getDefaultPermissions = (): IPermissions => {
  return {
    edit: false,
    delete: false,
    rename: false,
    clone: false,
    bulk: null
  };
}

export const getFolderPermissions = (app: Instance, folder: IFile): IFolderPermissions => {
  const isFolderOwner = isOwner(app, folder);
  const isRootFolder = isRoot(folder);

  return {
    edit: isFolderOwner,
    delete: isFolderOwner && !isRootFolder,
    rename: isFolderOwner && !isRootFolder,
    addFolder: isFolderOwner,
    addNotebook: isFolderOwner,
    clone: false,
    bulk: {
      edit: false,
      delete: isFolderOwner,
      rename: false,
      clone: false
    }
  };
}

export const getNotebookPermissions = (app: Instance, folder: IFile): INotebookPermissions => {
  const isFolderOwner = isOwner(app, folder);

  return {
    edit: isFolderOwner,
    delete: isFolderOwner,
    rename: isFolderOwner,
    addNote: isFolderOwner,
    clone: true,
    bulk: {
      edit: isFolderOwner,
      delete: isFolderOwner,
      rename: isFolderOwner,
      reorder: isFolderOwner,
      clone: false
    }
  };
}
