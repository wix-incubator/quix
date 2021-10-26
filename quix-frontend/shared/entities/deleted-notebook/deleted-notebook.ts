import uuid from 'uuid/v4';
import {IDeletedNotebook} from './types';
import {IFilePathItem} from '../file/types';
import {createEmptyIUser} from '../user/user';
import {IUser} from '../user';


export const createDeletedNotebook = (path: IFilePathItem[] = [], props: Partial<IDeletedNotebook> = {}, user: IUser = createEmptyIUser('')): IDeletedNotebook => ({
  id: uuid(),
  name: 'Deleted notebook',
  notes: [],
  isLiked: false,
  path,
  owner: user.id,
  ownerDetails: user,
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  dateDeleted: Date.now(),
  ...props
});
