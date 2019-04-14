import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';

interface IApp {
  searchText?: string;
  runners?: Record<string, any>; 
}

export default (app: Instance): IBranch => register => {
  function appReducer(state: IApp = {runners: {}}, action) {
    switch (action.type) {
      case 'app.setSearchText':
        return {...state, searchText: action.searchText};
      case 'app.addRunner':
        return {...state, runners: {}};
      case 'app.removeRunner':
        return {...state, runners: {}};
      default:
    }

    return state;
  }

  register(appReducer);
};
