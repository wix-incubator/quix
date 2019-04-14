import {createReducer, composeReducers} from '../common/create-reducer';
import {INotebook} from './types';
import {NotebookActions, NotebookActionTypes} from './actions';

export const notebookReducer = composeReducers(
  createReducer('notebook'),
  (state: INotebook | undefined, action: NotebookActions) => {
    switch (action.type) {
      case NotebookActionTypes.toggleIsLiked:
        return state && {...state, isLiked: action.isLiked};
      default:
        return state;
    }
  }
);
