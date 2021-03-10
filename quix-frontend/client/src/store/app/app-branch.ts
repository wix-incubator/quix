import {IBranch} from '../../lib/store';
import {App} from '../../lib/app';
import {Middleware} from 'redux';

import * as Runners from '../../services/runners';

export interface IApp {
  searchPage?: number;
  inputSearchText?: string;
  urlSearchText?: string;
  runners?: Record<string, any>;
  import: {
    type?: string;
    value?: string;
  };
}

export default (app: App): IBranch<IApp> => register => {
  const runnerMiddleware: Middleware = () =>
    next => (action: any) => {
      switch (action.type) {
        case 'app.addRunner':
          Runners.addRunner(app, null, action.id, action.runner, action.note, action.notebook);
          break;
        case 'app.removeRunner':
          Runners.removeRunner(action.id);
          break
        default:
      }

      return next(action);
    }

  const appReducer = (state: IApp = {
    runners: {},
    import: {},
  }, action): IApp => {
    switch (action.type) {
      case 'app.setSearchPage':
        return {...state, searchPage: action.searchPage};
      case 'app.setInputSearchText':
        return {...state, inputSearchText: action.inputSearchText};
      case 'app.setUrlSearchText':
        if (action.urlSearchText !== state.urlSearchText) {
          return {
            ...state,
            urlSearchText: action.urlSearchText,
            inputSearchText: action.origin === 'machine' ? action.urlSearchText : state.inputSearchText,
          };
        }
        break;
      case 'app.setImportType':
        return {...state, import: {...state.import, type: action.importType}};
      case 'app.setImportValue':
        return {...state, import: {...state.import, value: action.importValue}};
      case 'app.addRunner':
      case 'app.removeRunner':
        return {...state, runners: {}}; // just to trigger subscribers
      default:
    }

    return state;
  }

  register(appReducer, runnerMiddleware);
};

