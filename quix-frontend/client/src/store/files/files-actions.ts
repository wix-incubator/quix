import {IFile} from '../../../../shared';

export const setFile = (file: IFile) => ({
  type: 'file.set',
  file
});

export const setFiles = (files: IFile[]) => ({
  type: 'files.set',
  files
});

export const setError = (error: any) => ({
  type: 'files.view.setError',
  error
});

export const toggleMark = (file: IFile) => ({
  type: 'files.view.toggleMark',
  file
});

export const unmarkAll = () => ({
  type: 'files.view.unmarkAll'
});
