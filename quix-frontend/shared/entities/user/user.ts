import uuid from 'uuid/v4';
import {IUser} from './types';

export const createUser = (): IUser => ({
  id: uuid(),
  name: 'Local User',
  email: 'local@quix.com',
  avatar: ''
});
