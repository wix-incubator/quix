import {initNgScope, createNgModel} from '../../../core';

import template from './search.html';
import './search.scss';

export default function directive() {
  return {
    template,
    require: 'ngModel',
    restrict: 'E',
    transclude: true,
    scope: {
      minLength: '<',
      bsOptions: '<',
      onEnter: '&',
      placeholder: '@'
    },

    link: {
      pre(scope, element, attrs, ngModel) {
        createNgModel(scope, ngModel)
          .formatWith(text => ({text}))
          .parseWith(({text}) => text)
          .feedBack(false)
          .watchDeep(true);

        initNgScope(scope)
          .withOptions('bsOptions', {
            searchIcon: 'search',
            contextIcon: null
          })
          .withEvents({
            onClear() {
              scope.model.text = '';
              element.find('.bi-input').focus();
            },
            onKeypress(e) {
              if (e.keyCode === 13) {
                scope.onEnter();
              }
            }
          });

        element.on('focus', '.bi-input', () => element.addClass('bs-focused'));
        element.on('blur', '.bi-input', () => element.removeClass('bs-focused'));
      }
    }
  };
}
