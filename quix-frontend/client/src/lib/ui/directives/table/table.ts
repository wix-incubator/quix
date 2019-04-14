import {throttle, debounce, without, find} from 'lodash';
import {inject, initNgScope} from '../../../core';

import template from './table.html';
import './table.scss';
import { BufferedCollection, PartitionedCollection } from '../../../core/srv/collections';

const isCollection = (collection: BufferedCollection | PartitionedCollection) => {
  return collection && collection.models instanceof Array;
}

export default () => {
    const ACTIONS = {
      getSortValue(scope, row) {
        const fieldName = scope.order.field.name || scope.order.field;

        return scope.order.field.sort ? scope.order.field.sort(row[fieldName], row) : row[fieldName];
      }
    };

    function shouldFetchMore(container) {
      const viewportHeight = container.height();
      const contentHeight = container.get(0).scrollHeight;
      const topOffset = container.scrollTop();

      return contentHeight - topOffset - viewportHeight < 40;
    }

    function adjustHeaderPosition(container, columns) {
      // tslint:disable-next-line: restrict-plus-operands
      columns.css('margin-left', (-1 * container.get(0).scrollLeft) + 'px');
    }

    function initInfiniteScroll(scope, element, container, options) {
      if (options.infiniteScroll) {
        let columns = element.find('table thead .bi-table-th-content');
        scope.infiniteScrollEnabled = true;

        const redrawColumnsFunc = debounce(() => {
          if (!columns.length) {
            columns = element.find('table thead .bi-table-th-content');
          }

          columns.hide().show(0);
          adjustHeaderPosition(container, columns);
        }, 200);
        const applyFunc = () => scope.vm.getItems().more();
        const thenFunc = options.stickyHeader ? () => redrawColumnsFunc() : () => null;

        return throttle(axis => {
          if (axis === 'y' && scope.vm.getItems().hasMore() && shouldFetchMore(container)) {
            scope.$apply(applyFunc).then(thenFunc);
          }

          return true;
        }, 500);
      }
    }

    function initStickyHeader(element, container, options) {
      if (options.stickyHeader) {
        let columns = element.find('table thead .bi-table-th-content');
        element.addClass('bi-table-sticky-header');

        // scroll the sticky header horizontally
        return axis => {
          if (axis === 'x') {
            if (!columns.length) {
              columns = element.find('table thead .bi-table-th-content');
            }

            adjustHeaderPosition(container, columns);
          }

          return true;
        };
      }
    }

    function initEvents(scope, element, container, options) {
      const scrollHandlers = without([
        initInfiniteScroll(scope, element, container, options),
        initStickyHeader(element, container, options)
      ], undefined);

      if (scrollHandlers.length) {
        const domContainer = container.get(0);
        let lastXScroll = 0;

        const scrollHandler = () => {
          const axis = lastXScroll - domContainer.scrollLeft !== 0 ? 'x' : 'y';
          scrollHandlers.every(handler => handler(axis));
          lastXScroll = domContainer.scrollLeft;
        };

        container.on('scroll', scrollHandler);
      }
    }

    function initOrderBy(scope) {
      if (scope.orderBy) {
        const orderByField = find(scope.fields, field => field === scope.orderBy || (field as any).name === scope.orderBy);

        scope.order = {
          field: orderByField,
          reverse: !!scope.reverse
        };

        if (!(scope.vm.getItems() instanceof BufferedCollection)) {
          scope.getSortValue = row => ACTIONS.getSortValue(scope, row);
        }
      }
    }

    function orderCollection(scope, element) {
      if (isCollection(scope.vm.getItems())) {
        scope.vm.loading = true;

        inject('$timeout')(() => {
          const copy = Object.assign( Object.create( Object.getPrototypeOf(scope.vm.getItems())), scope.vm.getItems());
          const buffer = copy._buffer;

          copy.fetch();
          copy.feed(inject('$filter')('orderBy')(buffer, row => ACTIONS.getSortValue(scope, row), scope.order.reverse));

          if (buffer.length < scope.options.chunkSize) {
            copy.seal();
          }

          renderItems(scope, element, copy);
        });
      }
    }

    const initRows = (scope, element, rows: any[]) => {
      let items: any = rows;

      if (scope.options.infiniteScroll) {
        const collection = new BufferedCollection().setChunkSize(scope.options.chunkSize);
        collection.fetch();
        collection.feed(scope.rows);

        if (scope.rows.length < scope.options.chunkSize) {
          collection.seal();
        }

        items = collection;
      }

      renderItems(scope, element, items);
    }

    const initCollection = (scope, element, collection) => {
      renderItems(scope, element, collection);
    }

    const renderItems = (scope, element, items = scope.vm.getItems()) => {
      scope.vm.loading = true;
      scope.vm.toggleEnabled(true);

      inject('$timeout')(() => {
        scope.vm.setItems(items);

        const itemsRef = isCollection(scope.vm.getItems()) ? `items.models` : `items`;
        const itemRef = isCollection(scope.vm.getItems()) ? `model.data` : `model`;

        const html = inject('$compile')(`
          <tr
            bi-tbl-row
            ng-repeat="model in ${[
              scope.filter ? `(filteredItems = (${itemsRef} | filter:filter))` : `${itemsRef}`,
              scope.orderBy && !isCollection(items) ? 'orderBy:getSortValue:order.reverse' : '',
            ].filter(x => !!x).join(' | ')} track by ${scope.options.trackBy ? `${itemRef}[options.trackBy]`: '$index'}"
            ng-click="events.onRowClick(${itemRef})"
            ng-class="{selected: ${itemRef} === vm.selected}"
            fields="fields"
            row="::model"
            index="::$index"
            formatter="formatter()"
            bi-table-row-options="::options"
          ></tr>
          <tr ng-if="filteredItems.length === 0">
            <td class="bi-muted" colspan="{{fields.length}}">{{::emptyStateMsg}}</td>
          </tr>
        `)(scope.vm.getScope());

        element.find('tbody').html(html);

        inject('$timeout')(() => {
          scope.vm.destroyOldScope();
          scope.vm.toggleVisible(true);
          scope.vm.loading = false;

          scope.onRendered();
        });
      });
    }

    return {
      template,
      restrict: 'E',
      scope: {
        fields: '=',
        rows: '=',
        collection: '=',
        selected: '=',
        orderBy: '@',
        reverse: '@',
        filter: '&',
        formatter: '&',
        btOptions: '=',
        onRowClick: '&',
        onRowSelect: '&',
        onRowDeselect: '&',
        onRendered: '&',
        onDestroyed: '&',
        emptyStateMsg: '@'
      },

      link: {
        pre(scope, element, attrs) {
          const container = element.find('> div');

          initNgScope(scope)
            .withOptions('btOptions', {
              dynamicFields: false,
              infiniteScroll: false,
              stickyHeader: false,
              dontTransformColumnNames: false,
              trackBy: null,
              chunkSize: 50
            })
            .withVM({
              enabled: false,
              id: '',
              scope: null,
              oldScope: null,
              $init() {
                this.selected = scope.selected;
              },
              setItems(items) {
                this.oldScope = this.scope;
                this.scope = scope.$new();
                this.scope.items = items;

                scope.items = items;
              },
              getItems() {
                return this.scope && this.scope.items;
              },
              getScope() {
                return this.scope;
              },
              destroyOldScope() {
                if (this.oldScope) {
                  this.oldScope.$destroy();
                  scope.onDestroyed();
                }
              }
            })
            .withEvents({
              onOrderChange() {
                orderCollection(scope, element);
              },
              onRowClick(row) {
                if (scope.vm.selected === row) {
                  scope.vm.selected = null;
                  scope.onRowDeselect({row});
                } else {
                  scope.vm.selected = row;
                  scope.onRowSelect({row});
                }

                scope.onRowClick({row});
              }
            });

          initEvents(scope, element, container, scope.options);
          initOrderBy(scope);

          scope.filter = scope.filter();
          scope.emptyStateMsg = scope.emptyStateMsg || `Can't find any items`;

          scope.$watch('selected', selected => scope.vm.selected = selected);

          scope.$watch('rows', (rows, prev) => {
            if (rows && (rows !== prev || !scope.vm.getItems())) {
              initRows(scope, element, rows);
            }
          });

          scope.$watch('collection', (collection, prev) => {
            if (collection && (collection !== prev || !scope.vm.getItems())) {
              initCollection(scope, element, collection);
            }
          });
        }
      }
    };
  };