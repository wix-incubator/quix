import {initNgScope, inject, utils} from '../../../core';

import './maximizable.scss';

export default () => {
  return {
    restrict: 'A',
    scope: {
      onLoad: '&',
      onToggle: '&',
      biMaximizable: '=',
      bmOptions: '=',
    },

    link(scope, element) {
      let cleaner: Function = () => {};

      initNgScope(scope)
        .withVM({})
        .withOptions('bmOptions', {
          onIcon: 'fullscreen',
          offIcon: 'fullscreen_exit'
        })
        .withActions({
          toggle() {
            scope.vm.toggle();

            element.toggleClass('bm--maximized', scope.vm.enabled);

            if (scope.vm.enabled) {
              element.after('<div class="bm-backdrop"></div>');
              cleaner = utils.dom.onKey('escape', () => scope.actions.toggle(), scope);
            } else {
              element.parent().find('.bm-backdrop').remove();
              cleaner();
            }

            inject('$timeout')(() => scope.onToggle({maximized: scope.vm.enabled}));
          }
        });

      element.append(inject('$compile')(`
        <span class="bm-toggle" ng-if="biMaximizable !== false" ng-click="actions.toggle()">
          <i class="bi-action bi-icon" ng-if="!vm.enabled">{{::options.onIcon}}</i>
          <i class="bi-action bi-icon" ng-if="vm.enabled">{{::options.offIcon}}</i>
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
