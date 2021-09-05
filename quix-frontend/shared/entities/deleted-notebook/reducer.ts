import { createClientListReducer, createReducer } from '../common/create-reducer';
import { IDeletedNotebook } from './types';

export const deletedNotebookReducer = 
  createReducer<IDeletedNotebook>('deletedNotebook');

export const clientDeletedNotebookListReducer =
  createClientListReducer<IDeletedNotebook>('deletedNotebook');


