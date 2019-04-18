import {IFile} from '../../../../shared';

export const setFiles = (files: IFile[]) => ({
  type: 'files.set',
  files
});

export const setError = (files: IFile[]) => ({
  type: 'files.setError',
  files
});
