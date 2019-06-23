import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IFile, composeReducers, clientFileListReducer} from '../../../../shared';

export default (app: Instance): IBranch => register => {
  const favorites = composeReducers(
    clientFileListReducer,
    (state: IFile[] = null, action: any) => {
    switch (action.type) {
      case 'favorites.set':
        return action.favorites;
      default:
    }

    return state;
  });

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'favorites.set':
        return null;
      case 'favorites.setError':
        return action.error;
      default:
    }

    return state;
  }

  register(combineReducers({favorites, error}));
};
