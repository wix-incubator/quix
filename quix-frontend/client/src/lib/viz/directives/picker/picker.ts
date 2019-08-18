import {intersection} from 'lodash';
import {initNgScope, inject} from '../../../core';
import {IFieldCategories} from '../../services/chart/chart-conf';
import {categorizeFields} from '../../services/chart/chart-utils';

import template from './picker.html';
import './picker.scss';

function getVizTypes({dimensions, values, all}: IFieldCategories, types: string[] = []): string[] {
  const res = ['table'];

  if (values.length > 0 && all.length > 1) {
    res.push('chart');
  }

  if (values.length > 0 && dimensions.length > 0) {
    res.push('pie');
  }

  return types.length ? intersection(types, res) : res;
}

export default () => {
  return {
    restrict: 'E',
    template,
    scope: {
      data: '<',
      selected: '=',
      types: '=',
      onSelect: '&'
    },

    link: {
      pre(scope, element) {
        initNgScope(scope)
          .withVM({
            init() {
              this.types = getVizTypes(categorizeFields(scope.data && scope.data[0]), scope.types);
              this.selected = this.types.indexOf(scope.selected) !== -1 ? scope.selected : this.types[0];
            }
          })
          .withEvents({
            onSelect(type) {
              scope.vm.selected = type;
              inject('$timeout')(() => scope.onSelect({type}));
            }
          });

        scope.types = scope.vm.types.length > 1 ? scope.vm.types : null;
        scope.onSelect({type: scope.vm.selected});

        scope.$watch('data', (d, pd) => d !== pd && scope.vm.init());
      }
    }
  };
};
