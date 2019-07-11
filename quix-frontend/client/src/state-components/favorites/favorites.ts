import template from './favorites.html';
import './favorites.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {cache} from '../../store';
import {initEvents} from '../../services/scope';
import {IScope} from './favorites-types';
import VM from './favorites-vm';
import * as Scope from './favorites-scope';
import * as Events from './favorites-events';

export default (app: App, store: Store) => ({
  name: 'favorites',
  template,
  url: {},
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl, setTitle}) => {
    await cache.favorites.fetch(params.id);
  
    syncUrl();
    setTitle();

    store.subscribe('favorites', ({favorites, error}) => {
      scope.favorites = favorites;
      scope.error = error;
    }, scope);
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withVM(VM());

    initEvents(scope, conf, app, store, Events);
  }
}) as IStateComponentConfig;
