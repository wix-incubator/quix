import { combineReducers } from 'redux';
import { IBranch } from '../../lib/store';
import { App } from '../../lib/app';
import { composeReducers, IDeletedNotebook, clientDeletedNotebookReducer } from '@wix/quix-shared';

export default (app: App): IBranch => register => {
  const deletedNotebooks = composeReducers(
    clientDeletedNotebookReducer,
    (state: IDeletedNotebook[] = [], action: any) => {
      switch (action.type) {
        case 'deletedNotebooks.set':
          return action.deletedNotebooks;
        default:
      }

      return state;
    });

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'deletedNotebooks.set':
        return null;
      case 'deletedNotebooks.setError':
        return action.error;
      default:
    }

    return state;
  }

  register(combineReducers({ deletedNotebooks, error }));
};
