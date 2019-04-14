import {find, without, assign} from 'lodash';
import {initNgScope, createNgModel, inject} from '../../../core';

import template from './simple-select.html';
import './simple-select.scss';

function isNull(value) {
  return !value && typeof value !== 'boolean';
}

function filterCollection(collection, text: string, biOptions) {
  text = text.toLowerCase();

  return collection && collection.filter(item => biOptions.render(item).toLowerCase().indexOf(text) !== -1);
}

function getPlaceholder(falsyItemValue, falsyItemTitle, placeholder = 'Select a value') {
  return (isNull(falsyItemValue) && falsyItemTitle) || placeholder;
}

export default function directive() {
  function format(model, biOptions) {
    return biOptions.format(model);
  }

  function parse(model, biOptions) {
    return biOptions.parse(model);
  }

  function render(scope, model, biOptions) {
    if (isNull(biOptions.parse(model))) {
      scope.vm.current = null;
    } else {
      scope.vm.current = scope.renderItemText(model);
    }
  }

  function renderToggleTransclusion(scope, transclude, biOptions) {
    if (transclude.isSlotFilled('toggle')) {
      scope.vm.isCustomToggle = true;

      return transclude((_, tScope) => {
        tScope.item = {
          get formatted() {
            return scope.vm.current || scope.placeholder;
          },
          get placeholder() {
            return scope.placeholder;
          }
        };
      }, null, 'toggle');
    }

    return inject('$compile')(`
      <input
        type="text"
        class="bi-input bi-grow"
        ng-model="vm.current"
        ng-keydown="options.typeahead && events.onInputKeydown($event)"
        ng-keyup="options.typeahead && events.onInputKeyup()"
        ng-disabled="::readonly"
        ng-required="vm.required"
        ng-readonly="::!options.typeahead"
        placeholder="{{::placeholder}}"
        autocomplete="off"
      />
      <i class="bi-icon bi-muted" ng-if="::!readonly">expand_more</i>
    `)(scope);
  }

  function renderItemTransclusion(scope, item, transclude, biOptions) {
    const transcluded = transclude((_, tScope) => {
      tScope.item = item;
      tScope[biOptions.getKey()] = item;

      Object.defineProperty(tScope, 'highlight', {
        get() {
          return scope.vm.current;
        }
      });
    });

    return transcluded.text().trim().length ? transcluded : null;
  }

  function renderItem(scope, item) {
    const childScope = assign(scope.$new(), {
      text: scope.renderItemText(item)
    });

    return inject('$compile')(`
      <div ng-if="vm.searching" ng-bind-html="text | biHighlight:vm.current"></div>
      <div ng-if="!vm.searching">{{::text}}</div>
    `)(childScope);
  }

  return {
    template,
    require: ['ngModel', 'biOptions'],
    restrict: 'E',
    transclude: {
      toggle: '?toggle'
    },
    scope: {
      bsOptions: '=',
      onSearchChange: '&',
      readonly: '=',
      placeholder: '@'
    },

    link: {
      pre(scope, element, attrs, [ngModel, biOptions], transclude) {
        createNgModel(scope, ngModel)
          .formatWith(model => format(model, biOptions))
          .parseWith(model => parse(model, biOptions))
          .renderWith(model => render(scope, model, biOptions))
          .feedBack(false);

        initNgScope(scope)
          .readonly(scope.readonly)
          .withOptions('bsOptions', {
            typeahead: false,
            width: null // toggle
          })
          .withVM({
            current: null,
            nullItem: undefined,
            required: attrs.required,
            searching: false,
            pending: false,
            deferred: false,
            dropdownOpen: false,
            isCustomToggle: false
          })
          .withEditableEvents({
            onInputKeydown(e) {
              if (e.keyCode !== 27) { // escape
                scope.vm.searching = true;
                scope.vm.dropdownOpen = true;
              }
            },
            onInputKeyup() {
              if (scope.vm.searching && scope.vm.current) {
                scope.items = scope.vm.deferred ? null : filterCollection(scope.collection, scope.vm.current, biOptions);
              } else {
                scope.items = scope.vm.deferred ? null : scope.collection;
              }

              scope.onSearchChange({text: scope.vm.current});
            },
            onDropdownShow() {
              if (scope.options.typeahead && !scope.vm.searching) {
                element.find('input').select();
              }
            },
            onDropdownHide() {
              if (scope.options.typeahead) {
                scope.vm.searching = false;
                scope.items = scope.vm.deferred ? null : scope.collection;

                render(scope, scope.model, biOptions);
              }
            },
            onSelectItem(item) {
              scope.model = item;
              render(scope, item, biOptions);
            }
          });

        scope.hasNullItem = () => typeof scope.vm.nullItem !== 'undefined';
        scope.isNullModel = () => isNull(ngModel.$modelValue);
        scope.renderToggleHtml = () => ({
          html: renderToggleTransclusion(scope, transclude, biOptions)
        });
        scope.renderItemHtml = item => ({
          html: renderItemTransclusion(scope, item, transclude, biOptions) || renderItem(scope, item)
        });
        scope.renderItemText = item => {
          const text = biOptions.render(item);
          // tslint:disable-next-line: restrict-plus-operands
          return (!isNull(text) && '' + text) || scope.placeholder;
        };

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
            scope.items = null;
            return;
          }

          const falsyItem = find(collection, item => !biOptions.parse(item));
          const falsyItemValue = biOptions.parse(falsyItem);
          const falsyItemTitle = biOptions.render(falsyItem);

          if (isNull(falsyItemValue)) {
            collection = without(collection, falsyItem);
            scope.vm.nullItem = falsyItem;
          } else {
            scope.vm.nullItem = undefined;
          }

          scope.collection = collection;
          scope.items = collection;
          scope.placeholder = getPlaceholder(falsyItemValue, falsyItemTitle, scope.placeholder);
        });
      }
    }
  };
}
