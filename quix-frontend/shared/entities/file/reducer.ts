import {last, remove} from 'lodash';
import {createReducer, composeReducers, createListReducer, createClientReducer, createClientListReducer} from '../common/create-reducer';
import {INotebook} from '../notebook';
import {createFile} from './file';
import {IFilePathItem, IFile, FileType} from './types';
import {FileActionTypes} from './actions';

const moveFile = (files: IFile[], id: string, path: IFilePathItem[]) => {
  const file = files.find(file => file.id === id);

  if (file) {
    file.path = path;

    if (file.type === FileType.folder) {
      files.filter(f => 
        f.path.length && last(f.path)!.id === id).forEach(f => 
          moveFile(files, f.id, [...path, {id: file.id, name: file.name}]));
    }
  }

  return files;
}

const deleteFile = (files: IFile[], id: string) => {
  const file = remove(files, {id})[0];

  if (file && file.type === FileType.folder) {
    files.filter(f => 
      f.path.length && last(f.path)!.id === id).forEach(f => 
        deleteFile(files, f.id));
  }

  return files;
}

export const fileReducer = composeReducers(
  createReducer('file'),
  createReducer('notebook', (notebook: INotebook) => createFile(notebook.path, {
    id: notebook.id,
    name: notebook.name
  }))
);

export const clientFileReducer = composeReducers(
  createClientReducer('file'),
  createClientReducer('notebook')
);

export const fileListReducer = composeReducers(
  createListReducer('file', fileReducer) as any,
  createListReducer('notebook', fileReducer) as any
);

export const clientFileListReducer = composeReducers(
  createClientListReducer('file', fileReducer, {delete: false}) as any,
  createClientListReducer('notebook', fileReducer, {delete: false}) as any,
  ((state: IFile[], action: any) => {
    switch (action.type) {
      case FileActionTypes.moveFile:
        return state && [...moveFile(state, action.id, action.path)];
      case FileActionTypes.deleteFile:
        return state && [...deleteFile(state, action.id)];
      default: 
    }

    return state;
  }) as any
);
