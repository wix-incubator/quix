import {inject} from '../../../core';

import template from './progress-line.html';
import './progress-line.scss';

export default function () {
  return {
    template,
    restrict: 'E',
    scope: {
      value: '=',
      running: '='
    },

    link (scope, element) {
      scope.off = false;
      scope.progressBarStyle = function() {
        if (scope.running) {
          return {
            // tslint:disable-next-line: restrict-plus-operands
            width: scope.running ? scope.value + '%' : '100%'
          };
        }

        return {
          width: '0'
        };
      };

      scope.$watch('running', running => {
        if (running === false) {
          scope.off = true;
          inject('$timeout')(() => {
            element.find('.bpl-container-off').css('opacity', 0);
          });
        }
      });
    }
  };
}
