import {inject} from '../../../../core';

import template from './table-header.html';
import './table-header.scss';

export default () => {
  return {
    template,
    restrict: 'A',
    replace: true,
    scope: {
      fields: '=',
      order: '=',
      biTableHeaderOptions: '=',
      onOrderChange: '&'
    },

    link: {
      pre(scope) {
        const options = scope.biTableHeaderOptions || {};
        const toHumanCase = inject('$filter')('biToHumanCase');

        scope.setOrder = function (field) {
          if (field === scope.order.field) {
            scope.order.reverse = !scope.order.reverse;
          } else {
            scope.order.field = field;
            scope.order.reverse = false;
          }

          scope.onOrderChange({order: scope.order});
        };

        scope.formatField = function (field) {
          field = field.title || field.name || field;

          return options.dontTransformColumnNames ? field : toHumanCase(field);
        };
      }
    }
  };
};
