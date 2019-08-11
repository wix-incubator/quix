import template from './notebook.html';
import './notebook.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {cache} from '../../store';
import {initEvents} from '../../services/scope';
import {IScope} from './notebook-types';
import VM from './notebook-vm';
import {getRunners} from '../../services';
import * as Url from './notebook-url';
import * as Scope from './notebook-scope';
import * as Events from './notebook-events';

export default (app: App, store: Store) => ({
  name: 'notebook:id',
  template,
  url: Url,
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl, setTitle}) => {
    await cache.notebook.fetch(params.id);
    
    syncUrl(() => [store.getState('notebook.notes') || []]);

    store.subscribe('notebook', ({notebook, notes, error, queue, view, permissions}) => {
      scope.notebook = notebook;
      scope.notes = notes;
      scope.error = error;
      scope.queue = queue;
      scope.view = view;
      scope.permissions = permissions;
    }, scope);

    store.subscribe('notebook.notebook.name', name => {
      setTitle(({stateName}) => [name]);
    }, scope);

    store.subscribe('notebook.error', error => {
      if (error) {
        setTitle(() => ['Error']);
      }
    }, scope);

    store.subscribe('app.runners', () => {
      scope.runners = getRunners();
    }, scope);
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withOptions('$stateOptions', {isNew: false})
      .withVM(VM(app));

    initEvents(scope, conf, app, store, Events);
  }
}) as IStateComponentConfig;
