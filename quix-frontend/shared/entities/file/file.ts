import uuid from 'uuid/v4';
import {IFile, FileType, IFilePathItem} from './types';

const file = (type: FileType, path: IFilePathItem[] = [], props: Partial<IFile> = {}): IFile => ({
  id: uuid(),
  name: `New ${type}`,
  type,
  path,
  isLiked: false,
  owner: '',
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props
})

export const createFolder = (path: IFilePathItem[] = [], props: Partial<IFile> = {}): IFile => file(FileType.folder, path, props);
export const createFile = (path: IFilePathItem[] = [], props: Partial<IFile> = {}): IFile => file(FileType.notebook, path, props);
