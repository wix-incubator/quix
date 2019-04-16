import uuid from 'uuid/v4';
import {IFolder} from './types';
import {IFilePathItem} from '../file';

export const createFolder = (type: IFolder, path: IFilePathItem[] = [], props: Partial<IFolder> = {}): IFolder => ({
  id: uuid(),
  name: `New ${type}`,
  path,
  files: [],
  isLiked: false,
  owner: '',
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props
});
