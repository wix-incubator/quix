import template from './db-sidebar.html';
import './db-sidebar.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './db-sidebar-types';
import {cache} from '../../store';

const convert = (nodes: any[], path = [], res = []) => {
  nodes.forEach(node => {
    if (!node.children.length) {
      res.push({id: node.name, name: node.name, path, type: 'table'});
    } else {
      res.push({id: node.name, name: node.name, path, type: 'folder'});
      convert(node.children, [...path, {id: node.name, name: node.name}], res);
    }
  });

  return res;
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          db: {
            items: null
          }
        })
        .withEvents({
          onFileExplorerLoad() {
            scope.vm.db.toggle(true);
          }
        });

        cache.db.get();
        store.subscribe('db', (db) => {
          if (!db) {
            return;
          }

          scope.vm.db.items = convert(db);
          scope.vm.toggle(true);
        }, scope);
    }
  }
});
