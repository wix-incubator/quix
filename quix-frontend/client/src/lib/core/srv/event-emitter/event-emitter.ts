'use strict';

/**
 * Core services
 *
 * @author Our One Creator Which Flies and is Spaghetti and a Monster
 */
import {lodash as _} from '../../utils';

function cloneArray(arr: any[]) {
  return arr.slice(0);
}

const state = {
  state: {},

  clear() {
    this.state = {};
  },

  init(id) {
    this.state[id] = this.state[id] || new State();
  },

  get(id) {
    return this.state[id];
  },

  destroy(id) {
    // tslint:disable-next-line: no-dynamic-delete
    delete this.state[id];
  }
};

class State {
  private readonly events = {};

  private getEvent(eventName: string) {
    return this.events[eventName] = this.events[eventName] || {
      handlers: [],
      lastArgs: null
    };
  }

  addHandler(eventName: string, handler: (...args) => any) {
    const event = this.getEvent(eventName);

    event.handlers.push(handler);

    return event;
  }

  removeHandler(eventName: string, handler: (...args) => any) {
    _.pull(this.getEvent(eventName).handlers, handler);
  }

  setArgs(eventName, ...args) {
    const event = this.getEvent(eventName);

    event.lastArgs = [[...args]];

    return event;
  }

  setArgsKeepHistory(eventName, ...args) {
    const event = this.getEvent(eventName);
    if (!event.lastArgs) {
      event.lastArgs = [];
    }

    event.lastArgs.push([...args]);

    return event;
  }
}

/**
 * Adds event subscription ability to inheriting classes
 */
export class EventEmitter {
  private readonly __state;
  private readonly __id;

  /**
   * @param scope   Pass scope when the inheriting object is deep watched. This will create the internal state outside of the object.
   */
  constructor(scope?: angular.IScope) {
    if (scope) {
      this.__id = _.uniqueId();

      state.init(this.__id);
      this.setScope(scope);
    } else {
      this.__state = new State();
    }
  }

  private $state() {
    return this.__state ? this.__state : state.get(this.__id);
  }

  /**
   * Invokes all event subscribers
   */
  protected fire(eventName: string, ...args): EventEmitter {
    const event = this.$state().setArgs(eventName, ...args);

    cloneArray(event.handlers).forEach(handler => handler(...args));

    return this;
  }

  /**
   * Invokes all event subscribers, and also keep event in history list.
   */
  protected stream(eventName: string, ...args): EventEmitter {
    const event = this.$state().setArgsKeepHistory(eventName, ...args);

    event.handlers.forEach(handler => handler(...args));

    return this;
  }

  /**
   * Subscribes to event
   *
   * @param invoke  Pass true to immediately invoke the handler if event was already triggered
   * @param scope   Pass scope to automatically remove the handler when scope is destroyed
   */
  public on(eventName: string, handler: (...args) => any, invoke: boolean = false, scope?: angular.IScope): EventEmitter {
    const event = this.$state().addHandler(eventName, handler);

    if (invoke && event.lastArgs) {
      event.lastArgs.forEach(args => handler(...args));

    }

    if (scope) {
      scope.$on('$destroy', () => {
        this.$state().removeHandler(eventName, handler);
      });
    }

    return this;
  }

  /**
   * Subscribes to event, but only for one occurrence of the event.
   *
   * @param invoke  Pass true to immediately invoke the handler if event was already triggered
   */
  onOnce(eventName: string, handler: (...args) => any, invoke: boolean = false): EventEmitter {
    const wrappedHandler = (...args) => {
      handler(...args);
      this.$state().removeHandler(eventName, wrappedHandler);
    };

    const event = this.$state().addHandler(eventName, wrappedHandler);

    if (invoke && event.lastArgs) {
      wrappedHandler(...event.lastArgs[event.lastArgs.length - 1]);
    }

    return this;
  }

  /**
   * Invokes all event subscribers. This is a public version of {@link fire}.
   */
  public trigger(eventName: string, ...args): EventEmitter {
    this.fire(eventName, ...args);

    return this;
  }

  /**
   * Invokes all event subscribers, but also keep it in history. This is a public version of {@link stream}.
   */
  public triggerStream(eventName: string, ...args): EventEmitter {
    this.stream(eventName, ...args);

    return this;
  }

  /**
   * Use to update scope reference
   */
  public setScope(scope: angular.IScope): EventEmitter {
    if (scope) {
      scope.$on('$destroy', () => state.destroy(this.__id));
    }

    return this;
  }
}
