import template from './embed-note.html';
import './embed-note.scss';

import {initNgScope} from '../../../lib/core';
import {Store} from '../../../lib/store';
import {App} from '../../../lib/app';
import {IStateComponentConfig} from '../../../lib/app/services/plugin-builder';
import {cache} from '../../../store';
import VM from './embed-note-vm';
import * as Url from './embed-note-url';
import * as Scope from './embed-note-scope';

export default (app: App, store: Store) => ({
  name: 'embed.notebook:id',
  template,
  url: Url,
  scope: Scope,
  controller: async (scope: ng.IScope, params, {syncUrl}) => {
    await cache.notebook.fetch(params.id);
    
    syncUrl(() => [store.getState('notebook.notes') || []]);

    store.subscribe('notebook', ({error, permissions, view}) => {
      scope.error = error;
      scope.permissions = permissions;
      scope.view = view;
    }, scope);
  },
  link: scope => {
    initNgScope(scope).withVM(VM(app));
  }
}) as IStateComponentConfig;
