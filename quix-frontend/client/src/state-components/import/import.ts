import template from './import.html';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {setImportType, setImportValue} from '../../store/app/app-actions';
import { addNotebook } from '../../services';
import { fetchFileByName } from '../../services/files';

const importNote = async (app: App, store: Store, {type, value}) => {
  if (!type || !value) {
    return;
  }

  switch(type) {
    case 'rupert':
      const imports = await fetchFileByName('__imports__');

      if (!imports) {
        addNotebook(store, app, [], {name: '__imports__'});
      }

      break;
    default:
  }

  destroy(store);
}

const destroy = (store: Store) => store.dispatch([
  setImportType(null),
  setImportValue(null),
]);

export default (app: App, store: Store) => ({
  name: 'import',
  template,
  url: {
    importType: setImportType,
    importValue: setImportValue,
  },
  scope: {
    import: (scope, imp) => importNote(store, imp),
  },
  controller: (scope, params, {syncUrl}) => {
    syncUrl();

    store.subscribe('app.import', imp => {
      scope.import = imp;
    }, scope);
  },
  link: (scope) => {
    initNgScope(scope)
      .withEvents({});

    scope.$on('$destory', () => destroy(store));
  }
}) as IStateComponentConfig;
