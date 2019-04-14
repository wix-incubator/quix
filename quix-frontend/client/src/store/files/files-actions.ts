import {IFile} from '../../../../shared';

export const setFiles = (files: IFile[]) => ({
  type: 'files.set',
  files
});

export const setFile = (file: IFile) => ({
  type: 'file.set',
  file
});

export const toggleMark = (file: IFile) => ({
  type: 'files.view.toggleMark',
  file
});

export const unmarkAll = () => ({
  type: 'files.view.unmarkAll'
});
