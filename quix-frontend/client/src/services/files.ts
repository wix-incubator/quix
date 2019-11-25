import {isArray, last, takeWhile} from 'lodash';
import {Store} from '../lib/store';
import {App} from '../lib/app';
import {IFile, FileActions, createFolder, IFilePathItem, FileType} from '@wix/quix-shared';
import {isOwner} from './permissions';
import {cache} from '../store';

export const addFolder = async (
  store: Store,
  app: App,
  parentOrPath: IFile | IFilePathItem[],
  props: Partial<IFile> = {}
): Promise<IFile> => {
  let path = isArray(parentOrPath) ? parentOrPath : [...parentOrPath.path, {
    id: parentOrPath.id,
    name: parentOrPath.name,
  }];

  path = path.length ? path : await fetchRootPath();

  const folder = createFolder(path, {...props, owner: app.getUser().getEmail()});

  return store.logAndDispatch(FileActions.createFile(folder.id, folder))
    .then(() => folder);
}

export const deleteFolder = (store: Store, app: App, folder: IFile) => {
  const {id} = folder;

  return store.logAndDispatch(FileActions.deleteFile(id)).then(() => {
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

export const fetchFileByName = (name: string, parent?: IFile): Promise<IFile> => {
  return cache.files.get()
    .then(files => files.find(file => file.name === name && (!parent || (file.path.length && last<IFile>(file.path).id === parent.id))));
}

export const createFileByNamePath = <T>(
  store: Store,
  app: App,
  namePath: string[],
  fileCreator: (name: string, parent: IFile) => Promise<T>): Promise<T> => {
    return namePath.reduce<Promise<IFile>>(async (res, name, index) => {
      const parent = await res;
      let file = await fetchFileByName(name, parent);

      if (!file) {
        const isFolder = index < namePath.length - 1;

        if (isFolder) {
          file = file || await addFolder(store, app, parent, {name});
        } else {
          file = fileCreator(name, parent) as any;
        }
      }

      return file;
    }, fetchRoot()) as unknown as Promise<T>;
}

export const fetchFileParent = (id: string): Promise<IFile> => {
  return fetchFile(id)
    .then(file => fetchFile(last<any>(file.path).id));
}

export const fetchRootPath = (): Promise<IFilePathItem[]> => {
  return fetchRoot()
    .then(file => file && [{id: file.id, name: file.name}] || []);
}

export const goToFile = (
  app: App,
  file: Pick<IFile, 'id' | 'type' | 'owner' | 'path'>,
  params: {
    isNew?: boolean;
    note?: string;
  } = {
    isNew: false,
    note: null
  },
  options?: any,
) => {
  const id = isRoot(file) && isOwner(app, file) ? null : file.id;

  return app.go(file && file.type === FileType.notebook ? 'notebook' : 'files', {
    id,
    isNew: params.isNew,
    note: params.note
  }, options);
}

export const goToRoot = (app: App) => {
  app.go('files', {
    id: null,
    isNew: false
  });
}

export const goUp = (app: App, file: Pick<IFile, 'id' | 'path' | 'owner'>) => {
  const pathItem = last(file.path);

  const folder = {
    ...pathItem,
    type: FileType.folder,
    path: takeWhile(file.path, item => item.id !== pathItem.id),
    owner: file.owner
  };

  goToFile(app, folder);
}
