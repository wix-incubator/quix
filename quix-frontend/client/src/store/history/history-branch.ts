import { combineReducers } from 'redux';
import { IBranch } from '../../lib/store';
import { App } from '../../lib/app';
import { IHistory } from '@wix/quix-shared';

export default (app: App): IBranch => register => {
  const history = (state: IHistory[] = null, action: any) => {
    switch (action.type) {
      case 'history.set':
        return action.history;
      default:
    }

    return state;
  };

  const error = (state: any = null, action: any) => {
    switch (action.type) {
      case 'history.set':
        return null;
      case 'history.setError':
        return action.error;
      default:
    }

    return state;
  };

  register(combineReducers({ history, error }));
};
