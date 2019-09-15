import {StoreCache} from '../../lib/store';
import {setFavorites, setError} from './favorites-actions';
import {favorites} from '../../services/resources';
import {IFile} from '@wix/quix-shared';

export default store => new StoreCache<IFile[]>(store, 'favorites.favorites')
  .cacheWith(setFavorites)
  .catchWith(setError)
  .fetchWith(favorites);
