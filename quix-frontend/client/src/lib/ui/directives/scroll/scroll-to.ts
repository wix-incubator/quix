import {inject} from '../../../core';

const Offset = 25;

export default () => {
  return {
    restrict: 'A',
    scope: false,
    link(scope, element, attr) {
      attr.$observe('biScrollTo', scroll => {
        if (scroll === 'true') {
          inject('$timeout')(() => {
            const scrollParent = element.scrollParent();
            console.log(scrollParent)
            // tslint:disable-next-line: restrict-plus-operands
            const scrollTop = element.parent().offset().top + scrollParent.scrollTop() - Offset;
  
            scrollParent.animate({scrollTop}, 300);
          });
        }
      });
   }
  };
};
