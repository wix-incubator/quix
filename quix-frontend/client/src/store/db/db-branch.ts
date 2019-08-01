import {combineReducers} from 'redux';
import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';

export default (app: App): IBranch => register => {
  function db(state: any[] = null, action) {
    switch (action.type) {
      case 'db.set':
        return action.db;
      default:
    }

    return state;
  }

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'db.set':
        return null;
      case 'db.setError':
        return action.error;
      default:
    }

    return state;
  }

  register(combineReducers({db, error}));
};
