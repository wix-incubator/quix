import jquery from 'jquery';
import {initNgScope, inject} from '../../../core';
import {BufferedCollection} from '../../../core/srv/collections';
import {TableRenderer} from './table-renderer';

import template from './table.html';
import './table.scss';

export interface IScope extends angular.IScope {
  vm: any;
  state: any;
  statePrefix: string;
  $state: any;
  data: BufferedCollection;
  fields: string[];
  maximizable: any;
  events: any;
}

function load(scope: IScope, element) {
  new TableRenderer(element.find('.bvt-container')).draw(scope, scope.data, scope.fields, scope.formatter);
}

function loadAsync(scope, element) {
  inject('$timeout')(() => load(scope, element));
}

export default () => {
  return {
    restrict: 'E',
    template,
    scope: {
      data: '<',
      fields: '<',
      isPartial: '<',
      formatter: '&',
      statePrefix: '@',
      $state: '<'
    },

    link: {
      pre(scope: IScope, element) {
        const timeout = inject('$timeout');

        initNgScope(scope)
          .withVM({
            maximize: {
              $export() {
                return {isMaximized: this.enabled};
              },
              $import({isMaximized}) {
                this.toggle(isMaximized === 'true');
              }
            }
          })
          .withEvents({
            onMaximizableLoad(instance) {
              if (scope.vm.maximize.enabled) {
                timeout(() => instance.toggle(true), 100);
                scope.vm.maximize.toggle(false);
              }
            },
            onMaximizeToggle() {
              loadAsync(scope, element);
            },
            onFilterChange() {
              loadAsync(scope, element);
            }
          })
          .withState(scope.$state || 'table', `${scope.statePrefix}table`, {});

        if (!scope.vm.maximize.enabled) {
          loadAsync(scope, element);
        }

        element.on('dblclick', 'bi-tbl td', e => {
          jquery(e.currentTarget).css('white-space', 'normal');
        });
      }
    }
  };
};
