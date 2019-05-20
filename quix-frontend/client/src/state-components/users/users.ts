import template from './users.html';
import './users.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {cache} from '../../store';
import {initEvents} from '../../services/scope';
import {IScope} from './users-types';
import VM from './users-vm';
import * as Scope from './users-scope';
import * as Events from './users-events';

export default (app: App, store: Store) => ({
  name: 'base.users',
  template,
  url: {},
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl, setTitle}) => {
    await cache.users.fetch(params.id);
  
    syncUrl();
    setTitle();

    store.subscribe('users', ({users, error}) => {
      scope.users = users;
      scope.error = error;
    });
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withVM(VM());

    initEvents(scope, conf, app, store, Events);
  }
}) as IStateComponentConfig;
