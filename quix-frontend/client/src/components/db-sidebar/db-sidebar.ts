import template from './db-sidebar.html';
import './db-sidebar.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './db-sidebar-types';
import {cache} from '../../store';
import {convert} from '../../services/db';
import * as Resources from '../../services/resources';
import * as DbActions from '../../store/db/db-actions';
import {StateManager} from '../../services/state';

enum States {
  Initial,
  Error,
  Result,
  Content,
  Visible,
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          $init() {
            this.state = new StateManager(States);
          }
        })
        .withEvents({
          onFileExplorerLoad() {
            scope.vm.state.set('Visible');
          },
          onLazyFolderOpen(folder) {
            const path = [...folder.path, {id: folder.id, name: folder.name}];
            const [catalog, schema, table] = path.map(({id}) => id);

            return Resources.dbColumns(catalog, schema, table)
              .then(columns => convert(columns, [...path]))
              .then(columns => store.dispatch(DbActions.addColumns(folder.id, columns)));
          }
        });

      cache.db.get();
      store.subscribe('db', (db) => {
        const isInitial = scope.vm.state.is('Initial');

        scope.vm.state
          .force('Result', !!db, {db})
          .set('Content', !!db)
          .set('Visible', !isInitial);
      }, scope);
    }
  }
});
