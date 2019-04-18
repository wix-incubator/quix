import uuid from 'uuid/v4';
import {IFolder} from './types';
import {IFilePathItem} from '../file';

export const createFolderPayload = (path: IFilePathItem[] = [], props: Partial<IFolder> = {}): IFolder => ({
  id: uuid(),
  name: `New folder`,
  path,
  files: [],
  isLiked: false,
  owner: '',
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props
});
