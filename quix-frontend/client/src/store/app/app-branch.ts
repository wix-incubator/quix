import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';
import {Middleware} from 'redux';

import * as Runners from '../../services/runners';

interface IApp {
  searchText?: string;
  runners?: Record<string, any>;
}

const runnerMiddleware: Middleware = (api) =>
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
      case 'app.setSearchText':
        return {...state, searchText: action.searchText};
      default:
    }

    return state;
  }

  register(appReducer, runnerMiddleware);
};

