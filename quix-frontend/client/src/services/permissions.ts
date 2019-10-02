import {App} from '../lib/app';
import {IEntity, IFile} from '@wix/quix-shared';
import {isRoot} from './files';

export interface IPermissions {
  edit?: boolean;
  delete?: boolean;
  rename?: boolean;
  clone?: boolean;
  like?: boolean;
  bulk?: IPermissions;
}

export interface IFolderPermissions extends IPermissions{
  addFolder?: boolean;
  addNotebook?: boolean;
}

export interface INotebookPermissions extends IPermissions{
  addNote?: boolean;
  note?: IPermissions & {
    reorder?: boolean;
  };
  bulk?: INotebookPermissions & {
    reorder?: boolean;
  };
}

export const isOwner = (app: App, entity: Pick<IEntity, 'owner'>) => {
  return entity.owner === app.getUser().getEmail();
}

export const getDefaultPermissions = (): IPermissions => {
  return {
    edit: false,
    delete: false,
    rename: false,
    clone: false,
    like: false,
    bulk: null
  };
}

export const getFolderPermissions = (app: App, folder: IFile): IFolderPermissions => {
  const isFolderOwner = isOwner(app, folder);
  const isRootFolder = isRoot(folder);

  return {
    edit: isFolderOwner,
    delete: isFolderOwner && !isRootFolder,
    rename: isFolderOwner && !isRootFolder,
    clone: false,
    like: false,
    addFolder: isFolderOwner,
    addNotebook: isFolderOwner,
    bulk: {
      delete: isFolderOwner,
      rename: false,
      clone: false,
      like: false,
    }
  };
}

export const getNotebookPermissions = (app: App, folder: IFile): INotebookPermissions => {
  const isFolderOwner = isOwner(app, folder);

  return {
    edit: isFolderOwner,
    delete: isFolderOwner,
    rename: isFolderOwner,
    addNote: isFolderOwner,
    clone: true,
    like: true,
    note: {
      edit: isFolderOwner,
      delete: isFolderOwner,
      rename: isFolderOwner,
      reorder: isFolderOwner,
      clone: true,
      like: false,
    },
    bulk: {
      delete: isFolderOwner,
      reorder: isFolderOwner,
      clone: false,
      like: false,
    },
  };
}
