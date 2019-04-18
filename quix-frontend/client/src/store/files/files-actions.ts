import {IFile} from '../../../../shared';

export const setFiles = (files: IFile[]) => ({
  type: 'files.set',
  files
});

export const setError = (error: any) => ({
  type: 'files.setError',
  error
});
