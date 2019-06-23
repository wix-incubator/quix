import {createReducer, createClientReducer} from '../common/create-reducer';
import {INotebook} from './types';

export const notebookReducer = createReducer<INotebook>('notebook');
export const clientNotebookReducer = createClientReducer<INotebook>('notebook');
