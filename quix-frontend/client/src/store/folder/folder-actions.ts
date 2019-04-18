import {IFile} from '../../../../shared';

export const setFolder = (file: IFile) => ({
  type: 'folder.set',
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

export const setFileError = (error: any) => ({
  type: 'files.view.setFileError',
  error
});

export const toggleMark = (file: IFile) => ({
  type: 'files.view.toggleMark',
  file
});

export const unmarkAll = () => ({
  type: 'files.view.unmarkAll'
});
