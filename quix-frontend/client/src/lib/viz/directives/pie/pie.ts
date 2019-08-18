import { initNgScope, inject } from '../../../core';
import {PieRenderer} from './pie-renderer';
import {IInputItem} from '../../services/viz-conf';
import {ChartViz} from '../../services/chart/chart-viz-service';

import template from './pie.html';
import './pie.scss';

export interface IScope extends angular.IScope {
  vm: any;
  state: any;
  statePrefix: string;
  $state: any;
  data: IInputItem[];
  fields: string[];
  maximizable: any;
  viz: ChartViz;
  events: any;
}

function createRenderer(scope: IScope, element) {
  return new PieRenderer(element.find('.bvp-container'));
}

function load(scope: IScope, element) {
  scope.viz = scope.viz || new ChartViz(scope.data, createRenderer(scope, element), {
    fields: scope.fields,
    xMeta: 'dimensions',
  });

  scope.viz.filter().draw();
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
      bvOptions: '<',
      statePrefix: '@',
      $state: '<'
    },

    link: {
      pre(scope: IScope, element) {
        const timeout = inject('$timeout');

        initNgScope(scope)
          .withOptions('bvOptions', {
            filter: true
          })
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
          .withState(scope.$state || 'pie', `${scope.statePrefix}pie`, {});

        if (!scope.vm.maximize.enabled) {
          loadAsync(scope, element);
        }

        scope.$on('$destroy', () => scope.viz.destroy());
      }
    }
  };
};
