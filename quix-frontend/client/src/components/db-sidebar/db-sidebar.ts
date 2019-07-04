import template from './db-sidebar.html';
import './db-sidebar.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IFile} from '../../../../shared';
import {IScope} from './db-sidebar-types';
import {cache} from '../../store';
import {convert} from '../../services/db';
import * as Resources from '../../services/resources';
import * as DbActions from '../../store/db/db-actions';
import {StateManager} from '../../services/state';
import {openTempQuery} from '../../services';
import {pluginManager} from '../../plugins';
import {debounceAsync} from '../../utils';

enum States {
  Initial,
  Error,
  Result,
  Content,
  Search,
  Visible,
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      const search = debounceAsync(text => Resources.dbSearch(scope.vm.type, text));

      initNgScope(scope)
        .withVM({
          types: pluginManager.getPluginIdsByType('db'),
          search: {
            text: null
          },
          $export() {
            return {type: this.type};
          },
          $import({type}) {
            this.type = type;
          },
          $init() {
            this.state = new StateManager(States);
            this.type = this.type || this.types[0];
          }
        })
        .withEvents({
          onFileExplorerLoad() {
            scope.vm.state.set('Visible');
          },
          onLazyFolderFetch(folder: IFile) {
            const path = [...folder.path, {id: folder.id, name: folder.name}];
            const [catalog, schema, table] = path.map(({name}) => name);

            return Resources.dbColumns(scope.vm.type, catalog, schema, table)
              .then(({children: columns}) => convert(columns, [...path]))
              .then(columns => store.dispatch(DbActions.addColumns(folder.id, columns)));
          },
          onSelectTableRows(table: IFile) {
            const query = pluginManager.getPluginById(scope.vm.type, 'db').getSampleQuery(table);

            openTempQuery(scope, scope.vm.type, query, true);
          },
          onTypeChange(type) {
            scope.state.save();

            scope.vm.search.text = null;
            scope.vm.state.force('Initial');

            cache.db.fetch(type);
          },
          onSearchChange(text) {
            const {state} = scope.vm;

            if (!text) {
              state.set('Visible', true, {
                db: state.value().dbInitial
              });

              return;
            }

            state.force('Search', true);

            search(text)(res => {
              state.set('Visible', true, {
                db: convert(res)
              });
            });
          }
        })
        .withState('dbSidebar', 'dbSidebar', {});

      scope.getFolderPermissions = (folder: any) => {
        return {
          menu: folder.nodeType === 'table'
        };
      }

      store.subscribe('db.db', (db: any) => {
        const isInitial = scope.vm.state.is('Initial');

        scope.vm.state
          .force('Result', !!db, {db, dbInitial: db})
          .set('Content', () => !!db.length)
          .set('Visible', !isInitial);
      }, scope);

      store.subscribe('db.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);

      cache.db.fetch(scope.vm.type);
    }
  }
});
