import {IBranch} from '../../lib/store';
import {Instance} from '../../lib/app';

interface IDb {
  db: any;
}

export default (app: Instance): IBranch => register => {
  function db(state: IDb = null, action) {
    switch (action.type) {
      case 'db.set':
        return action.db;
      default:
    }

    return state;
  }

  register(db);
};
