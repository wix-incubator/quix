import {initNgScope, inject} from '../../../core';

import './maximizable.scss';

export default () => {
  return {
    restrict: 'A',
    scope: {
      onLoad: '&',
      onToggle: '&',
      biMaximizable: '='
    },

    link(scope, element) {
      initNgScope(scope)
        .withVM({})
        .withActions({
          toggle() {
            scope.vm.toggle();

            element.toggleClass('bm--maximized', scope.vm.enabled);

            if (scope.vm.enabled) {
              element.after('<div class="bm-backdrop"></div>');
            } else {
              element.parent().find('.bm-backdrop').remove();
            }

            inject('$timeout')(() => scope.onToggle({maximized: scope.vm.enabled}));
          }
        });

      element.append(inject('$compile')(`
        <span class="bm-toggle" ng-if="biMaximizable !== false" ng-click="actions.toggle()">
          <i class="bi-action bi-icon" ng-if="!vm.enabled">fullscreen</i>
          <i class="bi-action bi-icon" ng-if="vm.enabled">fullscreen_exit</i>
        </span>
      `)(scope));

      scope.onLoad({
        instance: {
          toggle() {
            scope.actions.toggle();
          }
        }
      });
    }
  };
};
