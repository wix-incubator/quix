import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {FileActions, createFolder, IFile, IFilePathItem} from '../../../shared';
import {find, last} from 'lodash';

export const addFolder = (store: Store, app: Instance, path: IFilePathItem[] = [], props: Partial<IFile> = {}) => {
  const folder = createFolder(path, {...props, owner: app.getUser().getEmail()});

  return store.dispatchAndLog(FileActions.createFile(folder.id, folder));
}

export const deleteFolder = (store: Store, app: Instance, file: IFile) => {
  const {id, path} = file;

  return store.dispatchAndLog(FileActions.deleteFile(id))
    .then(() => app.getNavigator().go('base.files', {
      id: path.length ? last<any>(path).id : null,
      isNew: false
    }));
}

export const findFileById = (files: IFile[], id: string) => {
  return find(files, {id});
}

export const findFilesByParent = (files: IFile[], parentId: string) => {
  return (files as IFile[]).filter(file => {
    if (parentId) {
      const parent = last(file.path);
      return parent && parent.id === parentId;
    }

    return !file.path.length;
  });
}