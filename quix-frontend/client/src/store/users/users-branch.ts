import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';
import {IUser} from '@wix/quix-shared';

export default (app: App): IBranch => register => {
  const users = (state: IUser[] = null, action: any) => {
    switch (action.type) {
      case 'users.set':
        return action.users;
      default:
    }

    return state;
  };

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'users.set':
        return null;
      case 'users.setError':
        return action.error;
      default:
    }

    return state;
  }

  register(combineReducers({users, error}));
};
