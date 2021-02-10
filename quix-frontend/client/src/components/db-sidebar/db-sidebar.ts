import template from './db-sidebar.html';
import './db-sidebar.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IFile} from '@wix/quix-shared';
import {IScope} from './db-sidebar-types';
import {cache} from '../../store';
import {convert} from '../../services/db';
import * as Resources from '../../services/resources';
import {Tree} from '../../react-components/file-explorer/FileExplorerComponent';
import {openTempQuery, StateManager} from '../../services';
import {pluginManager} from '../../plugins';
import {debounceAsync} from '../../utils';
import {DB} from '../../config';

enum States {
  Initial,
  Error,
  Result,
  Content,
  Search,
  SearchResult,
  SearchContent,
  Visible,
}

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      const search = debounceAsync(text => Resources.dbSearch(scope.vm.type, text));

      initNgScope(scope)
        .withVM({
          types: pluginManager.module('db').plugins().map(plugin => plugin.getId()),
          type: null,
          hideRoot: false,
          search: {
            text: null
          },
          $init() {
            this.state = new StateManager(States);
          }
        })
        .withEvents({
          onPluginPickerLoad(plugin) {
            if (!store.getState('db.db')) {
              cache.db.fetch(plugin);
            }
          },
          onFileExplorerLoad() {
            scope.vm.state.set('Visible');
          },
          onRetryClick() {
            scope.vm.state.force('Initial');
            cache.db.fetch(scope.vm.type);
          },
          onLazyFolderFetch(folder: IFile) {
            const path = [...folder.path, {id: folder.id, name: folder.name}];
            let catalog, schema, table;

            if (scope.vm.hideRoot) {
              catalog = DB.RootName;
              [schema, table] = path.map(({name}) => name);
            } else {
              [catalog, schema, table] = path.map(({name}) => name);
            }

            return Resources.dbColumns(scope.vm.type, catalog, schema, table)
              .then(({children: columns}) => convert(columns, {hideRoot: false}, [...path]));
          },
          async onLazyFolderFetchNew(n: Tree, path: string[]): Promise<Tree[]> {
            let response: any;
            if (scope.vm.hideRoot) {
              response = await Resources.dbColumns(
                scope.vm.type,
                DB.RootName, // catalog
                path[0], // schema
                path[1], // table
                );
            } else {
              response = await Resources.dbColumns(
                scope.vm.type,
                path[0], // catalog
                path[1], // schema
                path[2], // table
                );
            }
            return response.children.map(child => {return {...child, textIcon: child.dataType}});
          },
          transformNode(node: Tree): Tree {
            const newNode = node;

            const chooseIcon = (type) => {
              switch(type) {
                case 'catalog':
                  return 'book';
                case 'schema':
                  return 'storage';
                default:
                  return 'view_module';
              }
            }

            newNode.icon = chooseIcon(node.type);
            newNode.children = newNode.children.map(child => {
              return {
                ...child,
                icon: chooseIcon(child.type),
                lazy: child.type === 'table',
                more: child.type === 'table'
              }
            });
            return newNode;
          },
          onSelectTableRows(table: IFile) {
            const query = pluginManager.module('db').plugin(scope.vm.type)
              .getSampleQuery(table);

            openTempQuery(scope, scope.vm.type, query, true);
          },
          onSelectTableRowsNew(n: Tree, path: string[]) {
            const query = pluginManager.module('db').plugin(scope.vm.type)
              .getSampleQuery(
                {
                  path: path.slice(0, path.length - 1).map(el => {
                    return {
                      name: el
                    }
                  }),
                  name: n.name,
                } as any);

            openTempQuery(scope, scope.vm.type, query, true);
          },
          onTypeChange(type) {
            scope.vm.search.text = null;
            scope.vm.state.force('Initial');

            cache.db.fetch(type);
          },
          onSearchChange(text) {
            const {state, hideRoot} = scope.vm;

            if (!text) {
              state.set('Visible', true, {
                dbFiltered: [],
              });

              return;
            }

            state.force('Search', true);

            search(text)(res => state
              .set('SearchResult', !!res)
              .set('SearchContent', () => res.length, () => {
                const filtered = convert(res, {hideRoot});

                return {dbFiltered: filtered};
              })
            );
          }
        });

      scope.getFolderPermissions = (folder: any) => {
        return {
          menu: folder.nodeType === 'table'
        };
      }

      store.subscribe('db.db', (dbOriginal: any) => {
        const isInitial = scope.vm.state.is('Initial');
        
        let newDb = [];
        if (dbOriginal) {
          scope.vm.hideRoot = dbOriginal.length === 1 && dbOriginal[0] && dbOriginal[0].name === DB.RootName;
          newDb = dbOriginal && convert(dbOriginal, {hideRoot: scope.vm.hideRoot});
          dbOriginal = scope.vm.hideRoot ? dbOriginal[0].children : dbOriginal;
        }

        scope.vm.state
          .force('Result', !!dbOriginal, {db: newDb, dbOriginal})
          .set('Content', () => !!newDb.length)
          .set('Visible', !isInitial)
      }, scope);

      store.subscribe('db.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
