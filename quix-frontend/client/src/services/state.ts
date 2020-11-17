import {assign} from 'lodash';

const keys = e => Object.keys(e).filter(k => typeof e[k as any] === 'number');
const values = e => keys(e).map(k => e[k as any]);

class State {
  constructor(public index: number = -1) {}
}

export class StateManager<E> {
  private current: State;
  private readonly val = {};

  constructor(private readonly states: E) {
    this.current = new State(values(states)[0]);
  }

  is(state: keyof E) {
    return this.states[state] === this.current.index as any;
  }

  before(state: keyof E) {
    return this.current.index as any < this.states[state] as any;
  }

  after(state: keyof E) {
    return this.current.index as any > this.states[state] as any;
  }

  get() {
    return this.states[this.current.index];
  }

  set(state: keyof E, condition: boolean | Function = true, value: Record<string, any> | Function = null) {
    if (this.after(state) || (typeof condition === 'function' ? !condition(this.val) : !condition)) {
      return new NullStateManager();
    }

    this.current = new State(this.states[state] as any);
    this.value(value);

    return this;
  }
  
  force(state: keyof E, condition: boolean | Function = true, value: Record<string, any> | Function = null) {
    if ((typeof condition === 'function' ? !condition(this.val) : !condition)) {
      return new NullStateManager();
    }

    this.current = new State(this.states[state] as any);
    this.value(value);

    return this;
  }

  value(val?: Record<string, any> | Function) {
    if (typeof val === 'undefined') {
      return this.val;
    }

    assign(this.val, typeof val === 'function' ? val(this.val) : val);

    return this;
  }

  then(fn: Function) {
    fn(this);
    return this;
  }

  else(fn: Function) {
    return this;
  }
}

class NullStateManager {
  is() {
    return this;
  }
  before() {
    return this;
  }
  after() {
    return this;
  }
  set() {
    return this;
  }
  value() {
    return null;
  }
  then() {
    return this;
  }
  else(fn: Function) {
    fn();
    return this;
  }
}
