import {initNgScope} from '../../../core';

import template from './progress-gauge.html';
import './progress-gauge.scss';

export default function () {
  return {
    template,
    restrict: 'E',
    scope: {
      value: '=',
      bpgOptions: '='
    },

    link (scope, element) {
      initNgScope(scope).withOptions(scope.bpgOptions, {
        radius: 15,
        stroke: 3
      });
    }
  };
}
