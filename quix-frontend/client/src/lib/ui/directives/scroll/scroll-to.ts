import {inject, utils} from '../../../core';

const OFFSET = -10;

export default () => {
  return {
    restrict: 'A',
    scope: false,
    link(scope, element, attr) {
      attr.$observe('biScrollTo', scroll => {
        if (scroll === 'true') {
          inject('$timeout')(() => {
            utils.dom.scrollIntoView(element, true, OFFSET);
          });
        }
      });
   }
  };
};
