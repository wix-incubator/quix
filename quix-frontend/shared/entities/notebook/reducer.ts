import {createReducer, composeReducers, createClientReducer} from '../common/create-reducer';
import {INotebook} from './types';
import {NotebookActions, NotebookActionTypes} from './actions';

const commonReducer = (state: INotebook | undefined, action: NotebookActions) => {
  switch (action.type) {
    case NotebookActionTypes.toggleIsLiked:
      return state && {...state, isLiked: action.isLiked};
    default:
      return state;
  }
}

export const notebookReducer = composeReducers(
  createReducer('notebook'),
  commonReducer
);

export const clientNotebookReducer = composeReducers(
  createClientReducer('notebook'),
  commonReducer
);
