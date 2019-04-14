import template from './notebook.html';
import './notebook.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance as App} from '../../lib/app';
// import {IStateComponentConfig} from '../../lib/app/services/plugin-instance';
import {cache} from '../../store';
import {initEvents} from '../../services/scope';
import {IScope} from './notebook-types';
import VM from './notebook-vm';
import * as Runners from '../../services/runners';
import * as Url from './notebook-url';
import * as Scope from './notebook-scope';
import * as Events from './notebook-events';

export default (app: App, store: Store) => ({
  name: 'base.notebook:id',
  template,
  url: Url,
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl}) => {
    await cache.notebook.fetch(params.id);
    
    syncUrl(() => store.getState('notebook.notebook.notes'));

    store.subscribe('notebook', ({notebook, notes, queue, view, permissions}) => {
      scope.notebook = notebook;
      scope.notes = notes;
      scope.queue = queue;
      scope.view = view;
      scope.permissions = permissions;
    }, scope);

    store.subscribe('app.runners', () => {
      scope.runners = Runners.getRunners();
    }, scope);
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withOptions('$stateOptions', {isNew: false})
      .withVM(VM());

    initEvents(scope, conf, app, store, Events);
  }
}) as any;
