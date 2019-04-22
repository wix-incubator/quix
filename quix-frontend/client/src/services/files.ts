import {isArray, last, takeWhile} from 'lodash';
import {Store} from '../lib/store';
import {Instance} from '../lib/app';
import {IFile, FileActions, createFolder, IFolder, IFilePathItem} from '../../../shared';
import {FileType} from '../../../shared/entities/file';
import {isOwner} from './permissions';
import {cache} from '../store';

export const addFolder = async (store: Store, app: Instance, parentOrPath: IFolder | IFilePathItem[], props: Partial<IFile> = {}) => {
  let path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name
  }];

  path = path.length ? path : [await fetchRootPathItem()];

  const folder = createFolder(path, {...props, owner: app.getUser().getEmail()});

  return store.dispatchAndLog(FileActions.createFile(folder.id, folder));
}

export const deleteFolder = (store: Store, app: Instance, folder: IFolder | IFile) => {
  const {id} = folder;

  return store.dispatchAndLog(FileActions.deleteFile(id)).then(() => goUp(app, folder));
}

export const isRoot = (file: Pick<IFile, 'name' | 'type' | 'path'>) => {
  return !file.path.length && file.type === FileType.folder && file.name === 'My notebooks';
}

export const fetchRootPathItem = (): Promise<IFilePathItem> => {
  return cache.files.get()
    .then(files => files.find(isRoot))
    .then(file => file && {id: file.id, name: file.name});
}

export const goToFile = (app: Instance, file: Pick<IFile, 'id' | 'name' | 'type' | 'owner' | 'path'>, options: {
  isNew?: boolean;
} = {
  isNew: false
}) => {
  const id = isRoot(file) && isOwner(app, file) ? null : file.id;

  app.getNavigator().go(`base.${file && file.type === FileType.notebook ? 'notebook' : 'files'}`, {
    id,
    isNew: options.isNew
  });
}

export const goToRoot = (app: Instance) => {
  app.getNavigator().go(`base.files`, {
    id: null,
    isNew: false
  });
}

export const goUp = (app: Instance, file: Pick<IFile, 'id' | 'name' | 'path' | 'owner'>) => {
  const pathItem = last(file.path);

  const folder = {
    ...pathItem,
    type: FileType.folder,
    path: takeWhile(file.path, item => item.id !== pathItem.id),
    owner: file.owner
  };

  goToFile(app, folder);
}
