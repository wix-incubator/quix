import template from './import.html';

import moment from 'moment';
import {initNgScope, utils} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {setImportType, setImportValue} from '../../store/app/app-actions';
import { Import, Time } from '../../config';
import { addNotebookByNamePath, addNote, goToNotebook } from '../../services/notebook';
import { showToast } from '../../lib/ui/services/toast';
import { pluginManager } from '../../plugins';

const importNote = async (scope, app: App, store: Store, {type, value}) => {
  if (!type || !value) {
    app.getNavigator().goHome();
    return;
  }

  if (!pluginManager.module('note').plugin(type)) {
    scope.error = `"${type}" doesn't match any known note type`;
    return;
  }

  const notebook = await addNotebookByNamePath(store, app, [Import.FolderName, type]);
  const note = await addNote(store, notebook.id, type, {
    name: moment().format(Time.Format)
  });

  pluginManager.hooks.import.promise(store, note, value)
    .then(() => {
      goToNotebook(app, notebook, {note: note.id}, {location: 'replace'});

      showToast({
        text: `Imported a "${type}" note`,
        type: 'success',
        hideDelay: 3000,
      });
    })
    .catch(e => utils.scope.safeDigest(scope, () => scope.error = e));
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
    import: (scope, imp) => importNote(scope, app, store, imp),
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
