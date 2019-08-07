import template from './files.html';
import './files.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {cache} from '../../store';
import {initEvents} from '../../services/scope';
import {IScope} from './files-types';
import VM from './files-vm';
// import * as Url from './files-url';
import * as Scope from './files-scope';
import * as Events from './files-events';

export default (app: App, store: Store) => ({
  name: 'files:id',
  template,
  url: {},
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl, setTitle}) => {
    await cache.folder.fetch(params.id);
  
    syncUrl();

    scope.isRoot = !params.id;

    store.subscribe('folder', ({folder, files, error, view, permissions}) => {
      scope.folder = folder;
      scope.files = files;
      scope.error = error;
      scope.view = view;
      scope.permissions = permissions;
    }, scope);

    store.subscribe('folder.folder.name', (name: string) => {
       setTitle(() => params.id ? [name] : [app.getTitle(), 'My notebooks']);
    }, scope);

    store.subscribe('folder.error', error => {
      if (error) {
        setTitle(() => ['Error']);
      }
    }, scope);
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withOptions('$stateOptions', {isNew: false})
      .withVM(VM());

    initEvents(scope, conf, app, store, Events);
  }
}) as IStateComponentConfig;
