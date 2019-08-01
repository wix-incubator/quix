import {IScope} from 'angular';
import {assign, includes, without, uniq} from 'lodash';
import {initNgScope, createNgModel, inject, utils} from '../../../core';


const isNull = value => {
  return !value && typeof value !== 'boolean' && typeof value !== 'number';
}

export class DropdownList {
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
        debounce: 0,
        type: 'text',
        ...config.options
      })
      .withVM({
        isCustomToggle: false,
        renderedModel: null,
        keyNavOption: null,
        search: {
          text: null
        },
        options: {
          collection: null,
          filtered: null,
          falsy: null,
          deferred: {
            loading: false
          },
        }
      })
      .withEvents({
        onSearchChange: () => {
          const {vm, options} = this.scope;

          vm.search.toggle(true);

          if (!this.config.isArray || options.typeahead) {
            vm.options.toggle(true);

            this.initOptions();

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
          scope.vm.search.toggle(false);
          this.render(scope.model);
        },
        onOptionSelect: (...options) => {
          const {vm} = this.scope;

          vm.options.toggle(false);
          vm.search.toggle(false);

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

            this.render(scope.model);
          }
        }
      });

    biOptions.watch(async (collection: any) => {
      const {vm} = this.scope;

      const deferredId = ++this.deferredId;

      if (collection && collection.then) {
        this.initOptions(null);

        vm.options.deferred.toggle(true);
        vm.options.deferred.loading = true;

        collection = await collection;
      }

      if (deferredId === this.deferredId) {
        utils.scope.safeApply(scope, () => {
          this.initOptions(collection);
          vm.options.deferred.loading = false;
        });
      }
    });

    scope.renderToggle = () => this.renderToggle();
    scope.renderOption = option => this.renderOption(option);

    scope.placeholder = scope.placeholder || 'Select a value';
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

    if (this.config.isArray) {
      return model.map(item => biOptions.parse(item));
    }

    return biOptions.parse(model);
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

  private render(model: any[]) {
    const {biOptions} = this.controllers;
    const {vm} = this.scope;

    if (this.config.isArray) {
      vm.renderedModel = model.map(item => biOptions.render(item));
    } else {
      vm.search.text = biOptions.render(model);
    }

    this.initOptions();
  }

  private applySearchText(text) {
    const {vm, events} = this.scope;

    if (vm.search.enabled && !isNull(text)) {
      if (this.config.isArray) {
        const values: string[] | number[] = typeof text === 'string' ?text.split(',') : [text];
        events.onOptionSelect(...values);
      } else {
        events.onOptionSelect(text);
      }
    }
  }

  private initOptions(collection: any[] = this.scope.vm.options.collection) {
    const {biOptions} = this.controllers;
    const {vm} = this.scope;

    vm.options.collection = collection;
    vm.options.falsy = null;

    vm.options.filtered = collection && collection.filter(option => {
      const renderedOption = biOptions.render(option);
      // tslint:disable-next-line: restrict-plus-operands
      const renderedOptionLowerCase = ((renderedOption || '') + '').toLowerCase();
      let falsy = false;

      if (!vm.options.falsy && isNull(biOptions.parse(option))) {
        vm.options.falsy = {option};
        falsy = true;
      }

      return !falsy &&
        (!vm.search.enabled || !vm.search.text || includes(renderedOptionLowerCase, vm.search.text)) &&
        (!this.config.isArray || !includes(vm.renderedModel, renderedOption));
    });
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
