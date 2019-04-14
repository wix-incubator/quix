import {initNgScope} from '../../../core';

import './tooltip.scss';
import template from './tooltip.html';

export default () => {
  return {
    restrict: 'E',
    template,
    transclude: {
      toggle: 'biToggle'
    },
    scope: {
      btText: '@',
      btOptions: '<'
    },

    link: {
      pre(scope) {
        initNgScope(scope).withOptions('btOptions', {
          position: 'bottom'
        });
      }
    }
  };
};
