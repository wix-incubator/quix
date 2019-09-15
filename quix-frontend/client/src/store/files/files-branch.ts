import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';
import {
  IFolder,
  clientFileListReducer,
  composeReducers,
} from '@wix/quix-shared';

export interface IPermissions {
  edit: boolean;
}

export default (app: App): IBranch => register => {
  const files = composeReducers(
    (state: IFolder = null, action: any) => {
      switch (action.type) {
        case 'files.set':
          return action.files;
        default:
      }
  
      return state;
    },
    clientFileListReducer,
  );

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'files.set':
        return null;
      case 'files.setError':
        return action.error;
      default:
    }

    return state;
  }

  register(combineReducers({files, error}));
};
