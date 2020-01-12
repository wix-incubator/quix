import { StoreCache } from '../../lib/store';
import { setHistory, setError } from './history-actions';
import { history } from '../../services/resources';
import { IHistory } from '@wix/quix-shared';

export default store =>
  new StoreCache<IHistory[]>(store, 'history.history')
    .cacheWith(setHistory)
    .catchWith(setError)
    .fetchWith(history);
