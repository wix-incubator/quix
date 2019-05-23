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

  path = path.length ? path : await fetchRootPath();

  const folder = createFolder(path, {...props, owner: app.getUser().getEmail()});

  return store.dispatchAndLog(FileActions.createFile(folder.id, folder));
}

export const deleteFolder = (store: Store, app: Instance, folder: IFolder | IFile) => {
  const {id} = folder;

  return store.dispatchAndLog(FileActions.deleteFile(id)).then(() => {
    if (store.getState('folder.folder')) {
      goUp(app, folder);
    }
  });
}

export const isRoot = (file: Pick<IFile, 'type' | 'path'>) => {
  return !file.path.length && file.type === FileType.folder;
}

export const fetchRoot = (): Promise<IFile> => {
  return cache.files.get()
    .then(files => files.find(isRoot));
}

export const fetchFile = (id: string): Promise<IFile> => {
  return cache.files.get()
    .then(files => files.find(file => file.id === id));
}

export const fetchFileParent = (id: string): Promise<IFile> => {
  return fetchFile(id)
    .then(file => fetchFile(last<any>(file.path).id));
}

export const fetchRootPath = (): Promise<IFilePathItem[]> => {
  return fetchRoot()
    .then(file => file && [{id: file.id, name: file.name}] || []);
}

export const goToFile = (app: Instance, file: Pick<IFile, 'id' | 'type' | 'owner' | 'path'>, options: {
  isNew?: boolean;
  note?: string;
} = {
  isNew: false,
  note: null
}) => {
  const id = isRoot(file) && isOwner(app, file) ? null : file.id;

  app.go(file && file.type === FileType.notebook ? 'notebook' : 'files', {
    id,
    isNew: options.isNew,
    note: options.note
  });
}

export const goToRoot = (app: Instance) => {
  app.go('files', {
    id: null,
    isNew: false
  });
}

export const goUp = (app: Instance, file: Pick<IFile, 'id' | 'path' | 'owner'>) => {
  const pathItem = last(file.path);

  const folder = {
    ...pathItem,
    type: FileType.folder,
    path: takeWhile(file.path, item => item.id !== pathItem.id),
    owner: file.owner
  };

  goToFile(app, folder);
}
