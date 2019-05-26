import {createReducer, composeReducers, createClientReducer} from '../common/create-reducer';
import {INotebook} from './types';
import {NotebookActions, NotebookActionTypes} from './actions';

export const notebookReducer = createReducer<INotebook>('notebook');

export const clientNotebookReducer = composeReducers(
  createClientReducer('notebook'),
  (state: INotebook | undefined, action: NotebookActions) => {
    switch (action.type) {
      case NotebookActionTypes.toggleIsLiked:
        return state && {...state, isLiked: action.isLiked};
      default:
        return state;
    }
  }
);
