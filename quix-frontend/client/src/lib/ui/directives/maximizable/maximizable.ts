import {initNgScope, inject, utils} from '../../../core';

import './maximizable.scss';

const renderToggle = (scope, element) => {
  let parent = element.find('[bm-toggle]');
  let isCustom = false;

  if (parent.length) {
    isCustom = true;
  } else {
    parent = element;
  }

  parent.append(inject('$compile')(`
    <span class="bm-toggle ${isCustom ? 'bm-toggle-custom' : ''}" ng-if="biMaximizable !== false" ng-click="actions.toggle()">
      <i class="bi-action bi-icon" ng-if="!vm.enabled">{{::options.onIcon}}</i>
      <i class="bi-action bi-icon" ng-if="vm.enabled">{{::options.offIcon}}</i>
    </span>
  `)(scope));
}

export default () => {
  return {
    restrict: 'A',
    scope: {
      biMaximizable: '=',
      isMaximized: '=',
      bmOptions: '=',
      onLoad: '&',
      onToggle: '&',
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

            inject('$timeout')(() => {
              if (typeof scope.isMaximized !== 'undefined') {
                scope.isMaximized = scope.vm.enabled;
              }

              scope.onToggle({maximized: scope.vm.enabled});
            });
          }
        });

      renderToggle(scope, element);

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
