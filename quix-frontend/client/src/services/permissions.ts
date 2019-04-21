import {Instance} from '../lib/app';
import {IEntity, IFile} from '../../../shared';
import {isRoot} from './files';

export interface IPermissions {
  edit?: boolean;
  delete?: boolean;
  rename?: boolean;
  copy?: boolean;
}

export const isOwner = (app: Instance, entity: Pick<IEntity, 'owner'>) => {
  return entity.owner === app.getUser().getEmail();
}

export const getDefaultPermissions = (): IPermissions => {
  return {
    edit: false,
    delete: false,
    rename: false,
    copy: false
  };
}

export const getFolderPermissions = (app: Instance, folder: IFile): IPermissions => {
  const isFolderOwner = isOwner(app, folder);

  return {
    edit: isFolderOwner,
    delete: isFolderOwner && !isRoot(folder),
    rename: isFolderOwner && !isRoot(folder),
    copy: !isRoot(folder)
  };
}

export const getNotebookPermissions = (app: Instance, folder: IFile): IPermissions => {
  const isFolderOwner = isOwner(app, folder);

  return {
    edit: isFolderOwner,
    delete: isFolderOwner,
    rename: isFolderOwner,
    copy: true
  };
}
