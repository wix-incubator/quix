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
import {findFileById, findFilesByParent} from '../../services/files';
import {setFile} from '../../store/files/files-actions';

export default (app: App, store: Store) => ({
  name: 'base.files:id',
  template,
  url: {},
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl}) => {
    await store.dispatch(setFile(findFileById(await cache.files.get(), params.id) || {} as any))

    syncUrl();

    store.subscribe('files', ({file, view, permissions}) => {
      scope.file = file;
      scope.view = view;
      scope.permissions = permissions;
    }, scope);

    store.subscribe('files.files', (files) => {
      scope.files = findFilesByParent(files, params.id);
    }, scope);
  },
  link: scope => {
    const conf = initNgScope(scope)
      .withOptions('$stateOptions', {isNew: false})
      .withVM(VM());

    initEvents(scope, conf, app, store, Events);
  }
}) as IStateComponentConfig;
