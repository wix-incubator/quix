import {set} from 'lodash';
import {inject} from '../../../core';

export default () => {
  return {
    restrict: 'A',
    require: ['ngModel', '^biFilter'],
    scope: false,

    link(scope, element, attrs, [ngModel, biFilter]) {
      let mute = false;

      const hook = items => {
        if (!mute) {
          biFilter.setItems(items);
        }

        return items;
      };

      ngModel.$formatters.push(hook);

      biFilter.on('filtered', (items) => {
        mute = true;
        set(scope, attrs.ngModel, items);
        inject('$timeout')(() => mute = false);
      });
    }
  };
};
