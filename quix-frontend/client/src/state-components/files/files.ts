import template from './files.html';
import './files.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {cache} from '../../store';
import {initEvents} from '../../services/scope';
import {IScope} from './files-types';
import VM from './files-vm';
// import * as Url from './files-url';
import * as Scope from './files-scope';
import * as Events from './files-events';

export default (app: App, store: Store) => ({
  name: 'base.files:id',
  template,
  url: {},
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl, setTitle}) => {
    await cache.folder.fetch(params.id);
  
    syncUrl();

    store.subscribe('folder', ({folder, files, view, permissions}) => {
      scope.folder = folder;
      scope.files = files;
      scope.view = view;
      scope.permissions = permissions;
    }, scope);

    store.subscribe('folder.folder.name', name => {
      setTitle(({stateName}) => [stateName, name].filter(x => x));
    }, scope);
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withOptions('$stateOptions', {isNew: false})
      .withVM(VM());

    initEvents(scope, conf, app, store, Events);
  }
}) as IStateComponentConfig;
