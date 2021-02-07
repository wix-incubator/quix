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
import {RenderTree} from '../../react-components/file-explorer/FileExplorerComponent';
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
          async onLazyFolderFetchNew(n: RenderTree, path: string[]): Promise<RenderTree[]> {
            const response: any = await Resources.dbColumns(
              scope.vm.type,
              path[0], // catalog
              path[1], // schema
              path[2], // table
            );
            return response.children;
          },
          transformNode(node: RenderTree): RenderTree {
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
            newNode.icon = 'view_module';
            return newNode;
          },
          onSelectTableRows(table: IFile) {
            const query = pluginManager.module('db').plugin(scope.vm.type)
              .getSampleQuery(table);

            openTempQuery(scope, scope.vm.type, query, true);
          },
          onSelectTableRowsNew(n: RenderTree, path: string[]) {
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
        }

        scope.vm.state
          .force('Result', !!dbOriginal, {db: newDb, dbOriginal: dbOriginal})
          .set('Content', () => !!newDb.length)
          .set('Visible', !isInitial)
      }, scope);

      store.subscribe('db.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
