import template from './import.html';

import moment from 'moment';
import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {setImportType, setImportValue} from '../../store/app/app-actions';
import { Import, Time } from '../../config';
import { addNotebookByNamePath, addNote } from '../../services/notebook';

const importNote = async (app: App, store: Store, {type, value}) => {
  if (!type || !value) {
    return;
  }

  const noteName = moment().format(Time.Format);
  const notebook = await addNotebookByNamePath(store, app, [Import.FolderName, type]);
  const note = await addNote(store, app, notebook.id, type, {
    name: noteName,
    extraContent: {
      value
    }
  });

  app.go('notebook', {id: notebook.id, note: note.id});
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
    import: (scope, imp) => importNote(app, store, imp),
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
