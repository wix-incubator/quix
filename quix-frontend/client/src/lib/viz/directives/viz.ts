import {initNgScope} from '../../core';

import template from './viz.html';
import './viz.scss';

export default () => {
  return {
    restrict: 'E',
    template,
    scope: {
      type: '@',
      data: '<',
      fields: '<',
      tableData: '<',
      tableFields: '<',
      isPartial: '<',
      bvOptions: '<',
      tableFormatter: '&',
      statePrefix: '@',
      $state: '<'
    },

    link: scope => {
      initNgScope(scope)
        .withOptions('bvOptions', {
          picker: false,
          filter: true,
          types: []
        })
        .withVM({
          selected: {},
          $init() {
            this.toggle(true);

            if (!scope.options.picker) {
              this.select(scope.type || 'table');
            }
          },
          isVisible(type) {
            return this.selected[type];
          },
          select(type) {
            this.type = type;
            this.selected[type] = true;

            scope.type = type;
          }
        })
        .withEvents({
          onSelect(type) {
            scope.vm.select(type);
          }
        })
        .withState(scope.$state || 'viz', 'viz', {});

      scope.$watch('type', type => type && scope.events.onSelect(type));
      scope.$watch('data', (d, pd) => d !== pd && scope.vm.init());
    }
  };
};
