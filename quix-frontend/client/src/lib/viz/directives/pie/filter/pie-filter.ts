import {initNgScope, createNgModel} from '@wix/bi-core';
import {IFilterData, IFilterMeta} from '../../../services/chart/chart-conf';

import * as template from './pie-filter.html';
import './pie-filter.scss';

export interface IScope {
  model: IFilterData;
  meta: IFilterMeta;
  onChange: Function;
  onReset: Function;
  onDataFilterChange: Function;
  onViewFilterChange: Function;
}

export default () => {
  console.log(1)
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
