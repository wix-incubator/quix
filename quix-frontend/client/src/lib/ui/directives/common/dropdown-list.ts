import {IScope} from 'angular';
import {assign, includes, without, uniq} from 'lodash';
import * as JsSearch from 'js-search';
import {initNgScope, createNgModel, inject, utils} from '../../../core';

const isNull = value => {
  return !value && typeof value !== 'boolean' && typeof value !== 'number';
}

const toString = value => {
  return isNull(value) ? '' : `${value}`;
}

export class DropdownList {
  private searcher: any = null;
  private deferredId = 0;
  private readonly $timeout: ng.ITimeoutService = inject('$timeout');
  constructor(
    private readonly scope: IScope,
    private readonly element: any,
    private readonly attrs: any,
    private readonly controllers: Record<string, any>,
    private readonly transclude: ng.ITranscludeFunction,
    private readonly config: {
      optionsAlias: string;
      isArray?: boolean;
      options?: Record<string, any>;
    },
  ) {
    const {ngModel, biOptions} = controllers;

    createNgModel(scope as any, ngModel)
      .formatWith(model => this.format(model))
      .parseWith(model => this.parse(model))
      .validateWith(() => this.validate())
      .renderWith(model => this.render(model))
      .watchDeep(!!config.isArray)
      .feedBack(false);

    initNgScope(scope)
      .withOptions(config.optionsAlias, {
        freetext: false,
        typeahead: false,
        dropdownWidth: null,
        dropdownMinWidth: 'toggle',
        alignDropdown: 'left',
        debounce: 0,
        type: 'text',
        filterBy: [],
        ...config.options
      })
      .withVM({
        isCustomToggle: false,
        renderedModel: null,
        keyNavOption: null,
        search: {
          text: null,
          parsed: null,
        },
        options: {
          collection: null,
          filtered: null,
          searched: null,
          falsy: null,
          deferred: {
            loading: false
          },
          items() {
            return this.searched || this.filtered;
          }
        }
      })
      .withEvents({
        onSearchChange: () => {
          const {vm, options} = this.scope;

          vm.search.toggle(true);

          if (!this.config.isArray || options.typeahead) {
            vm.options.toggle(true);

            this.search();

            scope.onTypeahead({text: vm.search.text});
          }
        },
        onSearchKeypress: ({key}) => {
          const {options, vm} = scope;

          if (key === 'Enter' && options.freetext && !vm.keyNavOption) {
            this.applySearchText(vm.search.text);
          }
        },
        onSearchBlur: () => {
          const {options, vm} = scope;

          if (options.freetext) {
            this.applySearchText(vm.search.text);
          }
        },
        onSearchMousedown: () => {
          const {options, vm} = scope;

          if (options.typeahead) {
            scope.onTypeahead({text: null});

            if (this.config.isArray) {
              vm.options.toggle();
            }
          }
        },
        onDropdownShow: () => {
          const {options} = this.scope;

          if (!this.config.isArray && options.typeahead && scope.model) {
            this.element.find('input').select();
          }
        },
        onDropdownHide: () => {
          this.reset();
        },
        onOptionSelect: (...options) => {
          const {vm} = this.scope;

          vm.options.toggle(false);

          if (this.config.isArray) {
            scope.model = uniq([...scope.model, ...options]);
            vm.search.text = null;

            this.element.find('input').focus();
          } else {
            scope.model = options[0];
          }

          if (scope.onSelect) {
            this.$timeout(() => scope.onSelect({model: scope.model}));
          }
        },
        onOptionDelete: option => {
          if (this.config.isArray) {
            scope.model = without(scope.model, option);
          }
        }
      });

    biOptions.watch(async (collection: any) => {
      const {vm} = this.scope;

      const deferredId = ++this.deferredId;

      if (collection && collection.then) {
        this.setOptions(null);

        vm.options.deferred.toggle(true);
        vm.options.deferred.loading = true;

        collection = await collection;
      }

      if (deferredId === this.deferredId) {
        utils.scope.safeApply(scope, () => {
          this.setOptions(collection);
          vm.options.deferred.loading = false;
        });
      }
    });

    scope.renderToggle = () => this.renderToggle();
    scope.renderOption = option => this.renderOption(option);

    scope.placeholder = scope.placeholder || 'Select a value';
  }

  private reset() {
    const {vm} = this.scope;

    vm.search.toggle(false);
    vm.options.searched = null;

    this.render();
  }

  private format(model: any) {
    const {biOptions} = this.controllers;

    if (this.config.isArray) {
      return model ? model.map(item => biOptions.format(item)) : [];
    }

    return biOptions.format(model);
  }

  private parse(model: any[]) {
    const {biOptions} = this.controllers;
    let parsed;

    if (this.config.isArray) {
      parsed = model.map(item => biOptions.parse(item));
    } else {
      parsed = biOptions.parse(model);
    }

    inject('$timeout')(() => {
      this.reset();
      this.initOptions();
    });

    return parsed;
  }

  private validate() {
    return {
      required: model => {
        if (!this.attrs.required) {
          return true;
        }

        return this.config.isArray ? !!(model && model.length) : !isNull(model);
      }
    };
  }

  private render(model: any[] = this.scope.model) {
    const {biOptions} = this.controllers;
    const {vm} = this.scope;

    if (this.config.isArray) {
      vm.renderedModel = model.map(item => biOptions.render(item));
      vm.search.text = '';
    } else {
      vm.search.text = biOptions.render(model);
      vm.search.parsed = biOptions.parse(model);
    }
  }

  private applySearchText(text) {
    const {vm, events} = this.scope;

    if (vm.search.enabled && !isNull(text)) {
      if (this.config.isArray) {
        const values: string[] | number[] = typeof text === 'string' ? text.split(',') : [text];
        events.onOptionSelect(...values);
      } else {
        events.onOptionSelect(text);
      }
    }
  }

  private setOptions(collection: any[] = this.scope.vm.options.collection) {
    const {vm} = this.scope;

    vm.options.collection = collection;

    this.initOptions();
    this.search();
  }

  private initOptions(collection: any[] = this.scope.vm.options.collection) {
    const {vm, options} = this.scope;

    if (!collection) {
      vm.options.filtered = null;
      return;
    }

    const {biOptions} = this.controllers;

    vm.options.falsy = null;
    vm.options.filtered = collection.filter((option) => {
      if (!vm.options.falsy && isNull(biOptions.parse(option))) {
        vm.options.falsy = {option};
        return false;
      }

      if (this.config.isArray && includes(vm.renderedModel, biOptions.render(option))) {
        return false;
      }

      return true;
    });

    if (vm.options.filtered && options.filterBy.length) {
      this.searcher = new JsSearch.Search(options.filterBy[0]);

      options.filterBy.forEach(prop => this.searcher.addIndex(prop));
      this.searcher.addDocuments(vm.options.filtered);
    } else {
      this.searcher = null;
    }
  }

  private search(collection: any[] = this.scope.vm.options.filtered) {
    const {vm} = this.scope;

    if (!collection || !vm.search.enabled || !vm.search.text) {
      vm.options.searched = null;
      return;
    }

    let text = vm.search.text;

    if (this.searcher) {
      vm.options.searched = this.searcher.search(text);
      return;
    }

    const {biOptions} = this.controllers;
    text = toString(text).toLowerCase();

    vm.options.searched = collection.filter(option =>
      includes(toString(biOptions.render(option)).toLowerCase(), text));
  }

  public renderToggle() {
    const {scope} = this;
    const {biOptions} = this.controllers;
    const {vm, placeholder, options} = scope;
    const {type} = options;
    let html;

    if (this.transclude.isSlotFilled('toggle')) {
      html = this.transclude((_, tscope) => {
        tscope.placeholder = placeholder;

        Object.defineProperty(tscope, biOptions.getItemName(), {
          get() {
            return scope.model;
          }
        });

        Object.defineProperty(tscope, 'text', {
          get() {
            return vm.search.text;
          }
        });
      }, null, 'toggle');

      vm.isCustomToggle = true;
    } else {
      html = inject('$compile')(`
        <input
          type="${type}"
          class="bi-input bi-grow"
          ng-model="vm.search.text"
          ng-model-options="::{debounce: options.debounce}"
          ng-change="events.onSearchChange($event)"
          ng-mousedown="events.onSearchMousedown()"
          ng-keydown="events.onSearchKeypress($event)"
          ng-blur="events.onSearchBlur()"
          ng-disabled="::readonly"
          ng-required="vm.required"
          ng-readonly="::!options.typeahead"
          placeholder="{{::placeholder}}"
          autocomplete="off"
        />
        <i class="bi-icon bi-muted" ng-if="::!readonly">expand_more</i>
      `)(this.scope);
    }

    return {html};
  }

  public renderOption(option: any) {
    const {biOptions} = this.controllers;
    const {vm} = this.scope;
    let html;

    if (this.transclude.isSlotFilled('opt')) {
      html = this.transclude((_, tscope) => {
        tscope[biOptions.getItemName()] = option;

        Object.defineProperty(tscope, 'text', {
          get() {
            return vm.search.enabled ? vm.search.text : '';
          }
        });
      }, null, 'opt');
    } else {
      const scope = assign(this.scope.$new(), {
        option: biOptions.render(option)
      });

      html = inject('$compile')(`
        <div ng-if="!vm.search.enabled">{{::option}}</div>
        <div ng-if="vm.search.enabled" ng-bind-html="option | biHighlight:vm.search.text"></div>
      `)(scope);
    }

    return {html};
  }
}
