import {initNgScope, createNgModel} from '../../../../core';
import {IFilterData, IFilterMeta} from '../../../services/chart/chart-conf';

import template from './chart-filter.html';
import './chart-filter.scss';

export interface IScope {
  model: IFilterData;
  meta: IFilterMeta;
  onChange: Function;
  onReset: Function;
  onDataFilterChange: Function;
  onViewFilterChange: Function;
}

export default () => {
  return {
    restrict: 'E',
    template,
    require: 'ngModel',
    scope: {
      meta: '=',
      onChange: '&',
      onViewFilterChange: '&',
      onDataFilterChange: '&',
      onReset: '&'
    },

    link: {
      pre(scope: IScope, element, attr, ngModel) {
        createNgModel(scope as any, ngModel).watchDeep(true);

        initNgScope(scope).withEvents({
          onReset() {
            scope.onChange();
            scope.onReset();
          },
          onDataFilterSelect() {
            scope.onChange();
            scope.onDataFilterChange();
          }
        });
      }
    }
  };
};
