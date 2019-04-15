import {StoreCache} from '../../lib/store';
import {setDb} from './db-actions';
import {db} from '../../services/resources';
import {convert} from '../../services/db';

export default store => new StoreCache<any>(store, 'db')
  .cacheWith(setDb)
  .fetchWith(() => db().then(res => convert(res)));
