import {createReducer, composeReducers, createListReducer, createClientReducer, createClientListReducer} from '../common/create-reducer';
import {INotebook} from '../notebook';
import {createFile} from './file';

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
  createClientListReducer('file', fileReducer) as any,
  createClientListReducer('notebook', fileReducer) as any
);
