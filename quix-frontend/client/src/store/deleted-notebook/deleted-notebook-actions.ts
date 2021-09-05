import { IDeletedNotebook } from '@wix/quix-shared';

export const setDeletedNotebooks = (deletedNotebooks: IDeletedNotebook[]) => ({
  type: 'deletedNotebooks.set',
  deletedNotebooks
});

export const setError = (error: any) => ({
  type: 'deletedNotebooks.setError',
  error
});
