import {inject} from '../../../core';

export default () => {
  return {
    restrict: 'A',
    scope: false,
    link(scope, element, attr) {
      attr.$observe('biScrollTo', scroll => {
        if (scroll === 'true') {
          inject('$timeout')(() => element.get(0).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          }));
        }
      });
   }
  };
};
