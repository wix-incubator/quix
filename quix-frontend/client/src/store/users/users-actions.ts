import {IUser} from '@wix/quix-shared';

export const setUsers = (users: IUser[]) => ({
  type: 'users.set',
  users
});

export const setError = (error: any) => ({
  type: 'users.setError',
  error
});
