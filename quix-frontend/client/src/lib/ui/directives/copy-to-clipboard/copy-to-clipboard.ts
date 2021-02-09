import {initNgScope} from '../../../core';
import {showToast} from '../../services/toast';

import template from './copy-to-clipboard.html';
import './copy-to-clipboard.scss';

export default function directive() {
  return {
    template,
    restrict: 'E',
    transclude: true,
    scope: {
      text: '<'
    },

    link: {
      pre(scope, element) {
        initNgScope(scope)
          .withEvents({
            onCopy() {
              const input = element.find('input');

              input.get(0).focus();
              (input.get(0) as any).select();

              document.execCommand('Copy');

              showToast({text: 'Copied to clipboard', hideDelay: 3000, type: 'success'});
            }
          });
      }
    }
  };
}
