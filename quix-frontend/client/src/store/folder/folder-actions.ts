import {IFile, IFolder} from '@wix/quix-shared';

export const setFolder = (folder: IFolder) => ({
  type: 'folder.set',
  folder
});

export const setError = (error: any) => ({
  type: 'folder.setError',
  error
});

export const setFileError = (error: any) => ({
  type: 'folder.view.setFileError',
  error
});

export const toggleMark = (file: IFile) => ({
  type: 'folder.view.toggleMark',
  file
});

export const unmarkAll = () => ({
  type: 'folder.view.unmarkAll'
});
