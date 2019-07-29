import {initNgScope, inject} from '../../../core';

import template from './foldable.html';
import './foldable.scss';

export default () => {
  return {
    restrict: 'EA',
    template,
    transclude: true,
    scope: {
      isFolded: '=',
      stateName: '<?',
      bfOptions: '<?',
      onToggle: '&'
    },

    link(scope: ng.IScope, element: JQuery, attr: ng.IAttributes, ctrls, transclude: ng.ITranscludeFunction) {
      const $timeout: ng.ITimeoutService = inject('$timeout');

      const scopeHelper = initNgScope(scope)
        .withOptions('bfOptions', {
          style: 'default'  // default|folder
        })
        .withVM({
          fold: {
            $import({fold}) {
              this.enabled = fold;
            },
            $export() {
              return {fold: this.enabled};
            }
          }
        })
        .withEvents({
          onToggle(event: JQueryEventObject) {
            event.preventDefault();
            event.stopPropagation();

            scope.vm.fold.toggle();

            if (scope.state) {
              scope.state.save();
            }

            inject('$timeout')(() => {
              if (typeof scope.isFolded !== 'undefined') {
                 scope.isFolded = scope.vm.fold.enabled;
              }

              scope.onToggle({fold: scope.vm.fold.enabled});
            });
          }
        });

      if (scope.stateName) {
        scopeHelper.withState(scope.stateName, 'fold', {});
      }

      transclude((clone, transcludedScope) => {
        let toggleElement = clone.find('[bf-toggle]');
        toggleElement = toggleElement.length ? toggleElement : clone.filter('[bf-toggle]');

        const controlsElement = element.find('[bf-controls]').remove();
        let targetControlsElement = clone.find('[bf-controls]');
        targetControlsElement = targetControlsElement.length ? targetControlsElement : clone.filter('[bf-controls]');

        if (toggleElement.length) {
          toggleElement.on('click', event => {
            scope.events.onToggle(event);
            scope.$digest();
          });

          scope.$on('$destory', () => $(toggleElement).off('click'));
        }

        if (targetControlsElement.length) {
          targetControlsElement.replaceWith(controlsElement);
        }

        element.find('.bf-content').replaceWith(clone);

        transcludedScope.bf = {
          get fold() {
            return scope.vm.fold.enabled;
          }
        };

        $timeout(() => clone.find('.bf-no-transition').removeClass('bf-no-transition'));

        scope.$watch('isFolded', (isFolded: boolean) => typeof isFolded === 'boolean' && scope.vm.fold.toggle(isFolded));
      });
    }
  };
};
