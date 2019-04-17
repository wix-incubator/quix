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
import {setFile, setFileError} from '../../store/files/files-actions';

export default (app: App, store: Store) => ({
  name: 'base.files:id',
  template,
  url: {},
  scope: Scope,
  options: {isNew: false},
  controller: async (scope: IScope, params, {syncUrl, setTitle}) => {
    const fs = await cache.files.get();
    const f = params.id && findFileById(fs, params.id);
  
    syncUrl();

    store.subscribe('files', ({file, view, permissions}) => {
      scope.file = file;
      scope.view = view;
      scope.permissions = permissions;
    }, scope);

    if (!fs) {
      return;
    }

    if (!f && params.id) {
      await store.dispatch(setFileError({id: params.id, message: 'Folder not found'}));
      return;
    }

    await store.dispatch(setFile(f || {} as any));

    store.subscribe('files.file.name', name => {
      setTitle(({stateName}) => [stateName, name].filter(x => x));
    }, scope);

    store.subscribe('files.files', (files) => {
      if (!files) {
        return;
      }

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
