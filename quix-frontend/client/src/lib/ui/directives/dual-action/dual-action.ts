import {initNgScope, inject} from '../../../core';
import template from './dual-action.html';
import './dual-action.scss';

export default () => {
  return {
    restrict: 'EA',
    template,
    scope: {
      bdaIsOn: '=',
      bdaOnText: '@',
      bdaOffText: '@',
      bdaOnChange: '&'
    },

    link: {
      pre(scope) {
        initNgScope(scope).withEvents({
          toggle() {
            inject('$q').when(scope.bdaOnChange({isOn: !scope.bdaIsOn})).then(() => scope.bdaIsOn = !scope.bdaIsOn);
          }
        });
      }
    }
  };
};
