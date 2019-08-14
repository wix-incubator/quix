import uuid from 'uuid/v4';
import {IFile, FileType, IFilePathItem} from './types';
import {IUser} from '../user';
import {createEmptyIUser} from '../user/user';

const file = (type: FileType, path: IFilePathItem[] = [], props: Partial<IFile> = {}, user: IUser = createEmptyIUser('')): IFile => ({
  id: uuid(),
  name: `New ${type}`,
  type,
  path,
  isLiked: false,
  owner: user.id,
  ownerDetails: user,
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props
})

export const createFolder = (path: IFilePathItem[] = [], props: Partial<IFile> = {}): IFile => file(FileType.folder, path, props);
export const createFile = (path: IFilePathItem[] = [], props: Partial<IFile> = {}): IFile => file(FileType.notebook, path, props);
