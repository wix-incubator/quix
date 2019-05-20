import {IUser} from '../../../../shared';

export const setUsers = (users: IUser[]) => ({
  type: 'users.set',
  users
});

export const setError = (error: any) => ({
  type: 'users.setError',
  error
});
