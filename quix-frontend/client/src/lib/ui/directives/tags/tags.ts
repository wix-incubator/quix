import {includes, uniq, assign} from 'lodash';
import {initNgScope, createNgModel, utils, inject} from '../../../core';

import * as template from './tags.html';
import './tags.scss';

export interface IScope extends ng.IScope {
  model: any[];
}

function renderItemTransclusion(scope, transclude, biOptions, item) {
  if (transclude.isSlotFilled('item')) {
    return transclude((_, tScope) => {
      tScope.item = item;

      Object.defineProperty(tScope, 'highlight', {
        get() {
          return scope.vm.currentText;
        }
      });
    }, null, 'item');
  }

  const childScope = assign(scope.$new(), {
    text: biOptions.render(item)
  });

  return inject('$compile')(`
    <div ng-bind-html="text | biHighlight:vm.currentText"></div>
  `)(childScope);
}

function renderTagTransclusion(transclude, biOptions, tag) {
  if (transclude.isSlotFilled('tag')) {
    return transclude((_, tScope) => {
      tScope.tag = tag;
    }, null, 'tag');
  }

  return biOptions.render(tag);
}

function format(model: string[], biOptions) {
  return model ? model.map(item => biOptions.format(item)) : [];
}

function parse(model: any[], biOptions) {
  return model.map(item => biOptions.parse(item));
}

function render(scope, model: any[], biOptions) {
  scope.vm.current = model.map(item => biOptions.render(item));
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

function initItems(scope, biOptions, text?) {
  const items = scope.vm.deferred ? null : scope.collection;

  scope.items = items && items.filter(item => {
    const rendered = biOptions.render(item);
    return !includes(scope.vm.current, rendered) && (!text || includes(rendered, text));
  });
}

export default function directive(): ng.IDirective {
  return {
    template,
    require: ['ngModel', 'biOptions'],
    restrict: 'E',
    transclude: {
      item: '?item',
      tag: '?tag'
    },
    scope: {
      btOptions: '=',
      onAutocomplete: '&',
      onInputChange: '&',
      readonly: '=',
      placeholder: '@'
    },

    link: {
      pre(scope: IScope, element, attrs, ctrls: [ng.INgModelController, any], transclude) {
        const [ngModel, biOptions] = ctrls;
        scope.items = null;

        createNgModel(scope, ngModel)
          .formatWith(model => format(model, biOptions))
          .parseWith(model => parse(model, biOptions))
          .renderWith(model => render(scope, model, biOptions))
          .validateWith(() => validate(attrs))
          .watchDeep(true)
          .watchWith(() => initItems(scope, biOptions))
          .feedBack(false);

        initNgScope(scope)
          .readonly(scope.readonly)
          .withOptions('btOptions', {
            freetext: false,
            autocomplete: true,
            dropdownWidth: null,
            debounce: 0
          })
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
            onInputChange() {
              initItems(scope, biOptions, scope.vm.currentText);

              scope.onInputChange({text: scope.vm.currentText});
            }
          })
          .withEditableActions({
            addItem(...args) {
              scope.model = uniq(scope.model.concat(args.filter(s => !!s)));
              scope.vm.currentText = '';

              render(scope, scope.model, biOptions);

              element.find('input').trigger('focus');
            },
            removeItem(itemIndex: number) {
              scope.model = scope.model.filter((_, index) => index !== itemIndex);
              render(scope, scope.model, biOptions);
            }
          })
          .thenIfNotReadonly(() => {
            element.
              on('keypress blur', 'input', e => {
                // enter
                if (e.key === 'Enter' || e.type === 'focusout') {
                  if ((e.type === 'focusout' && scope.options.autocomplete) || !scope.options.freetext || !scope.vm.currentText) {
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

        scope.renderTag = tag => ({html: renderTagTransclusion(transclude, biOptions, tag)});
        scope.renderItem = item => ({html: renderItemTransclusion(scope, transclude, biOptions, item)});
      }
    }
  };
}
