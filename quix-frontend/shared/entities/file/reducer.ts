import {createReducer, composeReducers, createListReducer} from '../common/create-reducer';
import {INotebook} from '../notebook';
import {createFile} from './file';

export const fileReducer = composeReducers(
  createReducer('file'),
  createReducer('notebook', (notebook: INotebook) => createFile(notebook.path, {
    id: notebook.id,
    name: notebook.name
  }))
);

export const filesReducer = composeReducers(
  createListReducer('file', fileReducer) as any,
  createListReducer('notebook', fileReducer) as any
);
