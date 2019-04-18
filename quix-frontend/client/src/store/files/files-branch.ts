import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {
  IFolder,
  clientFileListReducer,
  composeReducers,
} from '../../../../shared';

export interface IPermissions {
  edit: boolean;
}

export default (app: Instance): IBranch => register => {
  const files = composeReducers(
    clientFileListReducer,
    (state: IFolder = null, action: any) => {
      switch (action.type) {
        case 'files.set':
          return action.files;
        default:
      }
  
      return state;
    },
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
