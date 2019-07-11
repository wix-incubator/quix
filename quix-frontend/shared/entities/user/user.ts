import uuid from 'uuid/v4';
import {IUser} from './types';

export const createUser = (props: Partial<IUser> = {}): IUser => ({
  id: uuid(),
  name: 'Local User',
  email: 'local@quix.com',
  avatar: '',
  rootFolder: '',
  dateCreated: 0,
  dateUpdated: 0,
  ...props
});

export const createEmptyIUser = (userId: string = ''): IUser => ({
  id: userId,
  name: '',
  email: userId,
  avatar: '',
  rootFolder: '',
  dateCreated: 0,
  dateUpdated: 0,
});