import template from './db-sidebar.html';
import './db-sidebar.scss';
import _ from 'lodash';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './db-sidebar-types';
import {cache} from '../../store';
import * as Resources from '../../services/resources';
import {Tree} from '../../react-components/file-explorer/FileExplorerComponent';
import {openTempQuery, StateManager} from '../../services';
import {pluginManager} from '../../plugins';
import {debounceAsync} from '../../utils';
import {DB} from '../../config';
import { DbPlugin } from '../../services/plugins';

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

const getNamePath = (node: Tree, path: string[]) => {
  const namePath = [node.name];
  let iteratorNode = node;

  for (let i = 1; i < path.length; i++) {
    iteratorNode = iteratorNode?.children.find(nodeProps => nodeProps.id === path[i]);
    namePath.push(iteratorNode.name);
  }

  return namePath;
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
          onPluginPickerLoad(plugin: DbPlugin) {
            if (!store.getState('db.db')) {
              cache.db.fetch(plugin.getId());
            }
          },
          onPluginPickerChange(plugin: DbPlugin) {
            scope.vm.search.text = null;
            scope.vm.state.force('Initial');

            cache.db.fetch(plugin.getId());
          },
          onRetryClick() {
            scope.vm.state.force('Initial');
            cache.db.fetch(scope.vm.type);
          },
          async onLazyFolderFetch(node: Tree, path: string[]): Promise<Tree[]> {
            const namePath = getNamePath(node, path);
            let response: any;
            if (scope.vm.hideRoot) {
              response = await Resources.dbColumns(
                scope.vm.type,
                DB.RootName, // catalog
                namePath[0], // schema
                namePath[1], // table
                );
            } else {
              response = await Resources.dbColumns(
                scope.vm.type,
                namePath[0], // catalog
                namePath[1], // schema
                namePath[2], // table
                );
            }
            return response.children.map(child => {return {...child, textIcon: child.dataType}});
          },
          transformNode(node: Tree, path: string[]): Tree {
            const newNode = _.cloneDeep(node);

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
            newNode.transformed = true;
            newNode.lazy = newNode.type === 'table';
            return newNode;
          },
          onSelectTableRows(node: Tree, path: string[]) {
            const namePath = getNamePath(node, path);
            const query = pluginManager.module('db').plugin(scope.vm.type)
              .getSampleQuery(
                {
                  path: namePath.slice(0, namePath.length - 1).map(el => {
                    return {
                      name: el
                    }
                  }),
                  name: namePath[namePath.length - 1],
                } as any);

            openTempQuery(scope, scope.vm.type, query, true);
          },
          onSearchChange(text) {
            const {state, hideRoot} = scope.vm;

            if (!text) {
              state.set('Visible', true, {
                dbOriginalFiltered: [],
              });

              return;
            }

            state.force('Search', true);

            search(text)(res => state
              .set('SearchResult', !!res)
              .set('SearchContent', () => res.length, () => {
                const dbOriginalFiltered = hideRoot ? _.flatten(res.map(tree => tree.children)) : res;

                return {dbOriginalFiltered};
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
        if (dbOriginal) {
          scope.vm.hideRoot = dbOriginal.length === 1 && dbOriginal[0] && dbOriginal[0].name === DB.RootName;
          dbOriginal = scope.vm.hideRoot ? _.flatten(dbOriginal.map(tree => tree.children)) : dbOriginal;
        }

        scope.vm.state
          .force('Result', !!dbOriginal, {dbOriginal})
          .set('Content', () => !!dbOriginal.length)
          .set('Visible', !!dbOriginal)
      }, scope);

      store.subscribe('db.error', (error: any) => {
        scope.vm.state.force('Error', !!error, {error});
      }, scope);
    }
  }
});
