import {StoreCache} from '../../lib/store';
import {setDb} from './db-actions';
import {db} from '../../services/resources';

export default store => new StoreCache<any>(store, 'db')
  .cacheWith(setDb)
  .fetchWith(db);
