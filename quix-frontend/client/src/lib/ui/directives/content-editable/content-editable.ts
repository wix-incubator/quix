import {initNgScope, inject} from '../../../core';
import './content-editable.scss';

function selectText(element) {
  const range = window.document.createRange();
  range.selectNodeContents(element.get(0));

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export default () => {
  function updateNgModel(scope, value, ngModel) {
    if (value) {
      ngModel.$setViewValue(value);
    } else {
      ngModel.$rollbackViewValue();
    }

    inject('$timeout')(() => {
      if (!ngModel.$valid) {
        ngModel.$setViewValue(scope.lastValidValue);
        ngModel.$setValidity('pattern', false);
      } else {
        if (scope.lastValidValue !== ngModel.$viewValue) {
          scope.onChange({prevValue: scope.lastValidValue});
        }

        scope.lastValidValue = ngModel.$viewValue;
        ngModel.$setValidity('pattern', true);
      }
    });
  }

return {
    restrict: 'A',
    require: ['ngModel'],
    scope: {
      ceOptions: '=',
      onChange: '&',
      onBlur: '&'
    },

    link: {
      pre(scope, element, attrs, [ngModel]) {
        ngModel.$render = () => {
          scope.lastValidValue = ngModel.$modelValue;
          element.text(ngModel.$modelValue);
        };

        initNgScope(scope, {ngModel})
          .withOptions('ceOptions', {
            autoEdit: false,
            toggler: 'always' // always | hover
          });

        if (scope.options.toggler === 'hover') {
          element.addClass('ce-toggler-hover');
        }

        element
          .attr('spellcheck', false)
          .on('focusout', () => {
            updateNgModel(scope, element.text(), ngModel);
            scope.onBlur();
          })
          .on('focus', () => selectText(element))
          .on('keypress', e => {
            // enter
            if (e.keyCode === 13) {
              element.blur();
              e.preventDefault();
              e.stopPropagation();

              return false;
            }
          })
          .on('keyup', e => {
            // escape
            if (e.keyCode === 27) {
              ngModel.$rollbackViewValue();
              element.blur();
            }
        });

        if (scope.options.autoEdit) {
          attrs.$observe('contenteditable', enabled => {
            if (enabled === 'true') {
              element.focus();

              setTimeout(() => {
                selectText(element);
              });
            }
          });
        }
      }
    }
  };
};
