import {cloneDeep} from 'lodash';
import angular from 'angular';
import {initNgScope, inject} from '../../../core';

import template from './editable.html';
import './editable.scss';

function finish(vm) {
  vm.edit.toggle(false);
  vm.error.toggle(false);
  vm.error.value = '';
}

export default () => {
  return {
    restrict: 'EA',
    template,
    require: 'ngModel',
    transclude: true,
    scope: {
      beOptions: '=',
      onToggle: '&',
      onChange: '&',
      readonly: '='
    },

    link(scope, element, attr, ngModel, transclude) {
      let childScope = null;

      // we're not deep-cloning ngModel.$viewValue as an optimization
      // it'll be cloned when toggling edit mode
      ngModel.$render = () => childScope.be.value = ngModel.$viewValue;

      function submit(mute = false) {
        // check if the model was changed
        if (angular.equals(ngModel.$viewValue, childScope.be.value)) {
          if (!mute) {
            finish(scope.vm);
          }

          return;
        }

        // save reference to original value
        const originalValue = ngModel.$viewValue;

        // commit new value (can be invalid)
        ngModel.$setViewValue(cloneDeep(childScope.be.value));

        if (!mute) {
          // wait for change to take effect
          inject('$timeout')(() => {
            // notify that a change has been made
            const promise = scope.onChange();

            if (!promise) {
              finish(scope.vm);
              return;
            }

            if (promise) {
              scope.vm.loading.toggle(true);

              promise.then(() => finish(scope.vm), error => {
                // commit original value if promise was rejected
                ngModel.$setViewValue(originalValue);

                // show error
                scope.vm.error.toggle(true);
                scope.vm.error.value = error && error.data && error.data.errorDescription || 'Unknown error';
              })
              .finally(() => scope.vm.loading.toggle(false));
            }
          });
        }
      }

      initNgScope(scope)
        .readonly(scope.readonly)
        .withOptions('beOptions', {
          saveText: 'save',
          mode: 'toggle'  // toggle(shows toggle button)|edit(in edit state by default)
        })
        .withVM({
          save: {
            isEnabled() {
              return scope.beForm.$valid && scope.beForm.$dirty;
            }
          },
          loading: {},
          error: {
            value: ''
          },
          edit: {
            $init() {
              this._toggle = this.toggle.bind(this);
              this.toggle = function(value) {
                this._toggle(value);

                element.toggleClass('be--editing', this.enabled);
                scope.beForm.$setPristine(!this.enabled);
              };
            }
          }
        })
        .withEditableEvents({
          onToggle(focus = false) {
            scope.vm.edit.toggle();

            if (scope.vm.edit.enabled) {
              // make a deep copy of the model (so we can check for changes when submitting)
              childScope.be.value = cloneDeep(ngModel.$viewValue);

              if (focus) {
                inject('$timeout')(() => {
                  element.find('.bi-input').first().focus();
                });
              }

              scope.onToggle();
            }
          },
          onSubmit(mute = false) {
            submit(mute);
          },
          onCancel() {
            // rollback changes (will call renderer)
            ngModel.$rollbackViewValue();

            finish(scope.vm);
          }
        });

      transclude((clone, transcludedScope) => {
        childScope = transcludedScope;

        const elementControls = element.find('[be-controls]');
        let cloneControls = clone.find('[be-controls]');
        cloneControls = cloneControls.length ? cloneControls : clone.filter('[be-controls]');

        if (cloneControls.length) {
          const cloneControlsChildren = cloneControls.children();

          cloneControls.replaceWith(elementControls);

          if (cloneControlsChildren.length) {
            elementControls.html(cloneControlsChildren);
          }
        }

        element.find('.be-content').html(clone);

        childScope.be = {
          get edit() {
            return scope.vm.edit.enabled;
          },
          value: null,
          save() {
            submit();
          }
        };
      });

      if (scope.options.mode === 'edit' && scope.events.onToggle) {
        scope.events.onToggle();

        childScope.$watch('be.value', () => scope.events.onSubmit(true), true);
      }

      scope.$on('$destory', () => childScope.$destroy());
    }
  };
};
