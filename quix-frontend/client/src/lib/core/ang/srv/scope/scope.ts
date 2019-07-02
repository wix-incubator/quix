'use strict';
import {ViewModel} from '../../../srv/view-model/view-model';
import {StateWrapper, StateWrapperOptions} from '../../../srv/state/state-wrapper';

import {lodash as _} from '../../../utils';

export class ScopeHelper {
  private _readonly = false;

  constructor(private readonly scope, private readonly controllers = {ngModel: null, errors: null}) {
    scope.events = {};
    scope.actions = {};
  }

  readonly(readonly) {
    this._readonly = readonly;

    return this;
  }

  withEvents(events = {}) {
    _.assign(this.scope.events, events);

    return this;
  }

  withEditableEvents(events = {}) {
    if (!this._readonly) {
      _.assign(this.scope.events, events);
    }

    return this;
  }

  withPermissionEvents<T extends {[eventName: string]: Function}>(events: T, permissions: (eventName: keyof T) => boolean) {
    events = _.reduce(events, (res, fn, name) => {
      if (permissions(name)) {
        res[name] = fn;
      }

      return res;
    }, {});

    this.withEvents(events);

    return this;
  }

  withActions(actions = {}) {
    _.assign(this.scope.actions, actions);

    return this;
  }

  withEditableActions(actions = {}) {
    if (!this._readonly) {
      _.assign(this.scope.actions, actions);
    }

    return this;
  }

  withVM(vm, params = {}) {

    if (this.scope.$vm) {
      vm = this.scope.$vm;
    } else {
      vm = _.isFunction(vm) ? new vm() : new ViewModel(vm);
    }

    const {scope, controllers} = this; /* clousre var for getters on the VM */


    Object.defineProperty(params, 'model', {
      get() {
        return scope.model;
      }
    });

    Object.defineProperty(params, 'modelValue', {
      get() {
        if (!controllers.ngModel) {
          throw new Error('scopeHelper: ngModel controller is required when accesing vm.$params.modelValue');
        }

        return controllers.ngModel.$modelValue;
      }
    });

    Object.defineProperty(params, 'viewValue', {
      get() {
        if (!controllers.ngModel) {
          throw new Error('scopeHelper: ngModel controller is required when accesing vm.$params.viewValue');
        }

        return controllers.ngModel.$viewValue;
      }
    });


    vm.init(params);

    this.scope.vm = this.scope.$vm = vm;

    return this;
  }

  withErrors(messages: any[]) {
    if (this.controllers.errors) {
      this.controllers.errors.setMessages(messages);
    }

    return this;
  }

  withOptions(options, defaults, watch?: any) {
    this.scope.options = _.defaults({}, typeof options === 'string' ? this.scope[options] : options, defaults);

    if (watch && typeof options === 'string') {
      this.scope.$watch(options, (opts, prevOptions) => {
        this.scope.options = _.defaults({}, opts, defaults);

        if (typeof watch === 'function') {
          watch(this.scope.options, prevOptions);
        }
      }, true);
    }

    return this;
  }

  withState(state: StateWrapper | string, clientName, options: StateWrapperOptions) {
    if (!state || !this.scope.vm) {
      return this;
    }

    const builder = StateWrapper.build()
      .withOptions(options)
      .withCustomTraverse(function (vm: ViewModel, callback, args) {
        vm.forEach(function (model) {
          callback(model, args);
        });
      }).setClientName(clientName)
      .useObject(this.scope.vm);

    if (typeof state === 'string') {
      builder.withNewState(state);
    } else {
      builder.withState(state);
    }

    this.scope.state = builder.end();

    this.scope.$on('$destroy', () => {
      this.scope.state.unregister();
    });

    return this;
  }

  thenIfNotReadonly(fn) {
    if (!this._readonly) {
      fn();
    }

    return this;
  }
}

export function init(scope, {ngModel = null, errors = null} = {}) {
  return new ScopeHelper(scope, {ngModel, errors});
}
