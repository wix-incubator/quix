import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';
import {IFile, composeReducers, clientFileListReducer} from '@wix/quix-shared';

export default (app: App): IBranch => register => {
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
