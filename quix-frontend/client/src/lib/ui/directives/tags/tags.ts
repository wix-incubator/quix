import {contains, uniq} from 'lodash';
import {initNgScope, createNgModel, utils} from '../../../core';

import template from './tags.html';
import './tags.scss';

export interface IScope extends ng.IScope {
  model: any[];
}

export default function directive(): ng.IDirective {
  function renderItem(item, biOptions) {
    return biOptions.render(item);
  }

  function format(model: string[], biOptions) {
    return model ? model.map(modelItem => biOptions.format(modelItem)) : [];
  }

  function parse(model: any[], biOptions) {
    return model.map(modelItem => biOptions.parse(modelItem));
  }

  function render(scope, model: any[]) {
    scope.vm.current = model.map(modelItem => scope.renderItem(modelItem));
  }

  function validate(attrs) {
    return {
      required(model) {
        if (!attrs.required) {
          return true;
        }

        return !!(model && model.length);
      }
    };
  }

  return {
    template,
    require: ['ngModel', 'biOptions'],
    restrict: 'E',
    scope: {
      btOptions: '=',
      onAutocomplete: '&',
      onInputChange: '&',
      readonly: '=',
      placeholder: '@'
    },

    link: {
      pre(scope: IScope, element, attrs, ctrls: [ng.INgModelController, any]) {
        const [ngModel, biOptions] = ctrls;
        scope.items = null;

        createNgModel(scope, ngModel)
          .formatWith(model => format(model, biOptions))
          .parseWith(model => parse(model, biOptions))
          .renderWith(model => render(scope, model))
          .validateWith(() => validate(attrs))
          .feedBack(false);

        initNgScope(scope)
          .readonly(scope.readonly)
          .withVM({
            current: [],
            currentText: '',
            pending: false,
            deferred: false,
            dropdown: {}
          })
          .withEditableEvents({
            onDropdownShow() {
              return scope.onAutocomplete();
            },
            onDropdownHide() {
              scope.items = scope.vm.deferred ? null : scope.collection;
            },
            onInputChange() {
              scope.items = scope.vm.deferred ? null : scope.collection;
              scope.onInputChange({text: scope.vm.currentText});
            }
          })
          .withEditableActions({
            addItem(...args) {
              scope.model = uniq(scope.model.concat(args.filter(s => !!s)));
              scope.vm.currentText = '';

              render(scope, scope.model);
              element.find('input').trigger('focus');
            },
            removeItem(itemIndex: number) {
              scope.model = scope.model.filter((_, index) => index !== itemIndex);
              render(scope, scope.model);
            }
          })
          .withOptions('btOptions', {freetext: false, autocomplete: true})
          .thenIfNotReadonly(() => {
            element.
              on('keypress blur', 'input', e => {
                // enter
                if (e.key === 'Enter' || e.type === 'focusout') {
                  if (!scope.options.freetext || !scope.vm.currentText) {
                    return;
                  }

                  utils.scope.safeApply(scope, () => {
                    scope.actions.addItem(...scope.vm.currentText.split(','));
                    scope.vm.dropdown.toggle(false);
                  });
                } else {
                  scope.vm.dropdown.toggle(true);
                }
              })
              .on('mouseup', 'input', () => {
                if (!scope.vm.deferred) {
                  scope.vm.dropdown.toggle(true);
                }
              });
          });

        let deferredId = 0;
        biOptions.watch(collection => {
          if (collection && collection.then) {
            collection.deferredId = ++deferredId;
            scope.vm.deferred = true;
            scope.vm.pending = true;

            collection.then(c => {
              if (collection.deferredId !== deferredId) {
                return;
              }

              scope.deferredCollection = c;
              scope.vm.pending = false;
            });
          } else {
            scope.deferredCollection = collection;
          }
        });

        scope.$watch('deferredCollection', collection => {
          if (!collection) {
            return;
          }

          scope.collection = collection;
          scope.items = collection;
        });

        scope.renderItem = item => renderItem(item, biOptions);
        scope.filterExsitingTags = function (item) {
          return !contains(scope.vm.current, renderItem(item, biOptions));
        };
      }
    }
  };
}
