import {IFile} from './types';
import {createReducer, composeReducers, createListReducer} from '../common/create-reducer';
import {INotebook, NotebookActionTypes, NotebookActions} from '../notebook';
import {createFile} from './file';
import {FileActionTypes, FileActions} from './actions';

export const fileReducer = composeReducers(
  createReducer('file'),
  createReducer('notebook', (notebook: INotebook) => createFile(notebook.path, {
    id: notebook.id,
    name: notebook.name
  }))
);

export const filesReducer = composeReducers(
  createListReducer('file', fileReducer) as any,
  createListReducer('notebook', fileReducer) as any,
  ((state: IFile[], action: FileActions | NotebookActions) => {
    switch (action.type) {
      case FileActionTypes.deleteFile:
      case NotebookActionTypes.deleteNotebook:
        return state && state.filter(file => file.path.findIndex(({id}) => id === action.id) === -1);
      default:
        return state;
    }
  }) as any
);
