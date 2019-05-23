import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {Middleware} from 'redux';

import * as Runners from '../../services/runners';

interface IApp {
  searchPage?: number;
  searchText?: string;
  runners?: Record<string, any>;
}

const runnerMiddleware: Middleware = () =>
  next => (action: any) => {
    switch (action.type) {
      case 'app.addRunner':
        Runners.addRunner(action.id, action.runner, action.note, action.notebook);
        break;
      case 'app.removeRunner':
        Runners.removeRunner(action.id);
        break
      default:
    }

    return next(action);
  }

export default (app: Instance): IBranch<IApp> => register => {
  function appReducer(state: IApp = {runners: {}}, action): IApp {
    switch (action.type) {
      case 'app.setSearchPage':
        return {...state, searchPage: action.searchPage};
      case 'app.setSearchText':
        return {...state, searchText: action.searchText};
      case 'app.addRunner':
      case 'app.removeRunner':
        return {...state, runners: {}}; // just to trigger subscribers
      default:
    }

    return state;
  }

  register(appReducer, runnerMiddleware);
};

