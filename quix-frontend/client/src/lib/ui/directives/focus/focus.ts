import {inject} from '../../../core';

export default () => {
  return {
    restrict: 'A',

    link(scope, element) {
      inject('$timeout')(() => {
        element = element.is('.bi-input') ? element : element.find('.bi-input');
        inject('$timeout')(() => element.get(0).focus());
      });
   }
  };
};
