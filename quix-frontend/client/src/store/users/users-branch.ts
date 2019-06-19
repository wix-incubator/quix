import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IUser} from '../../../../shared';

export default (app: Instance): IBranch => register => {
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
