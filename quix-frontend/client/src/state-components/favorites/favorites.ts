import './favorites.scss';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IReactStateComponentConfig} from '../../lib/app/services/plugin-builder';

import {cache} from '../../store';
import {Favorites, FavoritesProps} from './FavoritesComponent';
import {onFavoriteClick, onLikeToggle} from './favorites-events';
import _noop from 'lodash/noop';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'favorites',
  template: Favorites,
  url: {},
  scope: {
    favorites: _noop,
    error: _noop,
    onFavoriteClick: _noop,
    onLikeToggle: _noop
  },
  controller: async (scope: FavoritesProps, params, {syncUrl, setTitle}) => {
    await cache.favorites.fetch(params.id);

    syncUrl();
    setTitle();

    store.subscribe(
      'favorites',
      ({favorites, error}) => {
        scope.favorites = favorites;
        scope.error = error;
      },
      scope
    );

    scope.onFavoriteClick = onFavoriteClick(app);
    scope.onLikeToggle = onLikeToggle(store);
  }
});
