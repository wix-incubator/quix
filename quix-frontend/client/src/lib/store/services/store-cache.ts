import {isEqual, uniqueId} from 'lodash';
import {inject} from '../../core';
import {Store} from './store';

export class Request {
  private promise;
  private args;
  private id;

  private shouldHandleRequest(args: any[]) {
    return !this.promise || !isEqual(this.args, args);
  }

  private shouldHandleResponse(requestId) {
    return requestId === this.id;
  }

  private clear() {
    this.promise = this.args = null;
  }

  private createRequest(id: string, args, fetch: Function, onSuccess: Function, onError: Function) {
    return fetch(...args)
      .then(res => {
        if (!this.shouldHandleResponse(id)) {
          return inject('$q').reject();
        }

        delete res.$promise;
        delete res.$resolved;

        return onSuccess(res, ...args);
      })
      .catch(e => {
        onError({...e.data, status: e.status}, ...args);
        return null;
      })
      .finally(() => this.shouldHandleResponse(id) && this.clear());
  }

  do(args: any[], fetch: Function, onSuccess: Function, onError: Function) {
    if (!this.shouldHandleRequest(args)) {
      return this.promise;
    }

    this.id = uniqueId();
    this.args = args;
    this.promise = this.createRequest(this.id, args, fetch, onSuccess, onError);

    return this.promise;
  }
}

export class Cache<T> {
  protected cacher: Function;
  protected getter: Function;
  protected catcher: Function;
  private fetcher: Function;
  private readonly request = new Request();

  protected getCache(...args) {
    // abstract
  }

  protected setCache(...args) {
    // abstract
  }

  protected setError(...args) {
    // abstract
  }

  private fetchAndSetCache(...args): ng.IPromise<T> {
    return this.request.do(args, this.fetcher, (...arg) => this.setCache(...arg), (...arg) => this.setError(...arg));
  }

  cacheWith(cacher: Function): Cache<T> {
    this.cacher = cacher;
    return this;
  }

  getWith(getter: Function): Cache<T> {
    this.getter = getter;
    return this;
  }

  fetchWith(fetcher: Function): Cache<T> {
    this.fetcher = fetcher;
    return this;
  }

  catchWith(catcher: Function): Cache<T> {
    this.catcher = catcher;
    return this;
  }

  /**
   * Returns cached value if exists, otherwise fetches and sets a new value
   */
  get(...args): ng.IPromise<T> {
    return inject('$q').when((this.getCache(...args) as any) || this.fetchAndSetCache(...args));
  }

  /**
   * Fetches and sets a new value
   */
  fetch(...args): ng.IPromise<T> {
    return this.fetchAndSetCache(...args);
  }
}

export class StoreCache<T> extends Cache<T> {
  constructor(private readonly store: Store, private readonly branch: string) {
    super();
  }

  protected getCache(...args): T {
    const state = this.store.getState(this.branch);

    return this.getter ? this.getter(state, ...args) : state;
  }

  protected setCache(...args): ng.IPromise<T> {
    const action = this.cacher(...args);

    if (!action) {
      return;
    }

    return this.store.dispatch(action).then(() => this.getCache());
  }

  protected setError(...args): ng.IPromise<T> {
    const action = this.catcher && this.catcher(...args);

    if (!action) {
      return;
    }

    return this.store.dispatch(action);
  }
}
