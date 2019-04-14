import {inject} from '../../../core';

export default () => {
  return {
    restrict: 'A',
    require: ['ngModel', '^biFilter'],
    scope: false,

    link(scope, element, attrs, [ngModel, biFilter]) {
      const hook = items => {
        inject('$timeout')(() => biFilter.filter());
        return items;
      };

      ngModel.$parsers.push(hook);
      biFilter.addTerm(() => ngModel.$modelValue);
    }
  };
};
