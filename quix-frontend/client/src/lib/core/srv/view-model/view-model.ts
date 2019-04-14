'use strict';
import {lodash as _} from '../../utils';
import {injector} from '../injector';
/**
 * Core directive tools
 *
 * @author Our One Creator Which Flies and is Spaghetti and a Monster
 */

function createVM(template, root) {
  return _.cloneDeepWith(template, function (value) {
    if (_.isPlainObject(value)) {
      const vm = {};

      _.forOwn(value, (val, key) => {
        if (_.isPlainObject(val)) {
          vm[key] = new ViewModel(val, root);
        } else {
          vm[key] = createVM(val, root);
        }
      });

      return vm;
    }  if (_.isArray(value)) {
      return; // let lodash clone the value
    }

    return value;
  });
}

export class ItemsViewModel {
  private items: { [id: string]: ViewModel } = {};
  private identifier = item => item.id;

  constructor(private readonly vm?) { }

  get(item: Object): ViewModel {
    const id = this.identifier(item);

    if (_.isUndefined(id)) {
      return null;
    }

    return this.items[id] = this.items[id] || new ViewModel(this.vm).init();
  }

  all(): ViewModel[] {
    return _.values(this.items);
  }

  delete(item: Object): ItemsViewModel {
    // tslint:disable-next-line: no-dynamic-delete
    delete this.items[this.identifier(item)];
    return this;
  }

  deleteAll(): ItemsViewModel {
    this.items = {};
    return this;
  }

  identifyBy(identifier: (item: Object) => number): ItemsViewModel {
    this.identifier = identifier;

    return this;
  }

  forEach(fn) {
    let res;

    this.all().every(item => {
      res = item.forEach(fn);
      return res === false ? false : true;
    });

    return res;
  }
}

export class ViewModel {
  enabled: boolean;
  visible: boolean;

  constructor(vm: Object = null, protected $root = null) {
    this.$root = this.$root || this;

    try {
      this.enabled = false;
      this.visible = false;
    } catch (e) {
      //empty
    }

    if (vm) {
      _.assign(this, createVM(vm, this.$root));
    }
  }

  init(params?) {
    this.forEach(vm => {
      vm.$params = params;

      if (_.isFunction(vm.$init)) {
        vm.$init();
      }
    });

    return this;
  }

  isHead() {
    return this === this.$root;
  }

  /**
   * Toggle both "enabled" and "visible" flags
   */
  toggle(enabled) {
    try {
      this.toggleEnabled(enabled);
      this.toggleVisible(enabled);
    } catch (e) {
      //empty
    }
  }

  /**
   * Toggle the "enabled" flag
   */
  toggleEnabled(enabled) {
    try {
      this.enabled = typeof enabled !== 'undefined' ? enabled : !this.enabled;
    } catch (e) {
      //empty
    }

    return this.enabled;
  }

  /**
   * Toggle the "visible" flag
   */
  toggleVisible(visible) {
    try {
      this.visible = typeof visible !== 'undefined' ? visible : !this.visible;
    } catch (e) {
      //empty
    }

    return this.visible;
  }

  reload() {
    this.toggleVisible(false);

    return injector.get('$timeout')(() => this.toggleEnabled(false)).then(() => injector.get('$timeout')(() => this.toggle(true)));
  }

  /**
   * Create a view model for items. Useful for managing view state of items in a list.
   */
  createItemsVm(vm?) {
    return new ItemsViewModel(vm);
  }

  forEach(fn) {
    let res = fn(this);

    if (res !== false) {
      _.forOwn(this, (val, key) => {
        if (val instanceof ViewModel && val.isHead()) {
          return;
        }

        if (val instanceof ViewModel || val instanceof ItemsViewModel) {
          return (res = val.forEach(fn));
        }
      });
    }

    return res;
  }
}

/**
 * Create a view model object for use in the view layer
 *
 * @param vm  Plain object representation of the view model. Nested objects will be also converted to ViewModel instances.
 */
export function create(vm: Object = null, root?): ViewModel {
  return new ViewModel(vm, root);
}
