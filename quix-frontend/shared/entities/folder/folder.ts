import uuid from 'uuid/v4';
import {IFolder} from './types';
import {IFilePathItem} from '../file';
import {IUser} from '../user';
import {createEmptyIUser} from '../user/user';

export const createFolderPayload = (path: IFilePathItem[] = [], props: Partial<IFolder> = {}, user: IUser = createEmptyIUser('')): IFolder => ({
  id: uuid(),
  name: `New folder`,
  path,
  files: [],
  isLiked: false,
  owner: user.id,
  ownerDetails: user,
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props
});
