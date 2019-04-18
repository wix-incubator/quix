import {find, last, isArray} from 'lodash';
import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {IFile, FileActions, createFolder, IFolder} from '../../../shared';
import {FileType, IFilePathItem} from '../../../shared/entities/file';
import {isOwner} from './permission';

export const addFolder = (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], props: Partial<IFile> = {}) => {
  const path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  const folder = createFolder(path, {...props, owner: app.getUser().getEmail()});

  return store.dispatchAndLog(FileActions.createFile(folder.id, folder));
}

export const deleteFolder = (store: Store, app: Instance, folder: IFile) => {
  const {id, path} = folder;

  return store.dispatchAndLog(FileActions.deleteFile(id))
    .then(() => app.getNavigator().go('base.files', {
      id: path.length ? last<any>(path).id : null,
      isNew: false
    }));
}

export const goToFile = (app: Instance, file: IFile, isRoot = false) => {
  const id = isRoot && isOwner(app, file) ? null : file.id;

  app.getNavigator().go(`base.${file && file.type === FileType.notebook ? 'notebook' : 'files'}`, {
    id,
    isNew: false
  });
}

export const findFileById = (files: IFile[], id: string) => {
  return find(files, {id});
}
