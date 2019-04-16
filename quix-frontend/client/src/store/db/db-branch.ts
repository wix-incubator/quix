import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';

export default (app: Instance): IBranch => register => {
  function db(state: any[] = null, action) {
    switch (action.type) {
      case 'db.set':
        return action.db;
      case 'db.addColumns':
        return state.map(item => {
          if (item.id === action.id) {
            item.lazy = false;
          }
          return item;
        }).concat(action.columns);
      default:
    }

    return state;
  }

  register(db);
};
