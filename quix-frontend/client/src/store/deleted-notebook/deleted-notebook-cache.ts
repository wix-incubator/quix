import { StoreCache } from '../../lib/store';
import { IDeletedNotebook } from '@wix/quix-shared';
import { setDeletedNotebooks, setError } from './deleted-notebook-actions';
import { deletedNotebooks } from '../../services/resources';



export default store => new StoreCache<IDeletedNotebook>(store, 'deletedNotebooks.deletedNotebooks')
  .cacheWith(setDeletedNotebooks)
  .catchWith(setError)
  .fetchWith(deletedNotebooks);
