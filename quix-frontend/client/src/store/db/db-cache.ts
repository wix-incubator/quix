import {StoreCache} from '../../lib/store';
import {setDb, setError} from './db-actions';
import {db} from '../../services/resources';

export default store => new StoreCache<any>(store, 'db.db')
  .cacheWith(setDb)
  .catchWith(setError)
  .fetchWith(db);
