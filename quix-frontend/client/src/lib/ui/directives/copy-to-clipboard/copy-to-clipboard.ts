import {initNgScope, inject} from '../../../core';
import {showToast} from '../../services/toast';

import template from './copy-to-clipboard.html';
import './copy-to-clipboard.scss';

export default function directive() {
  return {
    template,
    restrict: 'E',
    transclude: true,
    scope: {
      text: '<',
      lazyText:'&'
    },

    link: {
      pre(scope, element) {
        initNgScope(scope).withEvents({
          onCopy() {
            scope.textValue = scope.text || scope.lazyText();
 
            inject('$timeout')(() => {
              const input = element.find('textarea');

              input.get(0).focus();
              (input.get(0) as any).select();

              document.execCommand('Copy');

              showToast({
                text: 'Copied to clipboard',
                hideDelay: 3000,
                type: 'success',
              });
            });
          },
        });
      },
    },
  };
}
