import {isArray, find, pull, forEach, get, assign, chain as _} from 'lodash';
import {utils, inject} from '../../core';
import StoreLogger, {ServerFrameworkType} from './store-logger';
import * as Redux from 'redux';
const {scope: scopeUtils} = utils;

export type IBranch<T = any> = (fn: (reducer: Redux.Reducer<T>, ...middleware: Redux.Middleware[]) => void) => void;
export type ReduxStore<S> = Redux.Store<S>;
export interface IBranches {
  [key: string]: IBranch;
}

function getLogParams({type, ...action}) {
  delete (action as any).$log;
  delete (action as any).$defer;
  delete (action as any).$next;

  return [type, action];
}

function logAction(logger, action) {
  return logger.log(...getLogParams(action));
}

function logBulkAction(logger, ...actions) {
  logger = logger.bulk();

  actions.forEach(action => logger.add(...getLogParams(action)));

  return logger.log();
}

function resolveActions(action, promises = [], res = null, deferred = null, isBulk = false) {
  const $q = inject('$q');

  deferred = deferred || $q.defer();
  isBulk = isBulk || isArray(action);
  res = res || (isArray(action) ? action : [action]);

  if (action.then) {
    const promise = {promise: action, action: null};

    promises.push(promise);

    promise.promise.then(actn => {
      promise.action = actn;
      resolveActions(actn, promises, res, deferred, isBulk);
    }, () => deferred.reject());
  } else {
    let promise = find(promises, {action});

    if (promise) {
      pull(promises, promise);
    } else {
      promise = {promise: action, action};
    }

    res = _(res)
      .map(item => item === promise.promise ? promise.action : item)
      .flattenDeep()
      .value();

    if (isArray(action)) {
      action.forEach(actn => resolveActions(actn, promises, res, deferred, isBulk));
    }

    if (promises.length === 0) {
      deferred.resolve({actions: res, isBulk});
    }
  }

  return deferred.promise;
}

function logMiddleware(logger) {
  /**
   * @param actions  array of action definitions
   *
   * @return Promise
   */
  return store => next => actions => {
    const $q = inject('$q');

    const {$log, $bulk, $defer} = actions;
    const action = actions[0];
    let res;

    if (!$bulk && !$defer) {
      res = next(action);
    } else {
      res = action;
    }

    if ($log) {
      res = $bulk ? logBulkAction(logger, ...actions) : logAction(logger, action);

      if ($defer && !$bulk) {
        res.then(() => next(action));
      }
    }

    return $q.when(res).then(() => action);
  };
}

function promiseMiddleware(biStore) {
  return store => next => action => {
    const {$log = false, $defer = false} = action;

    const res = resolveActions(action).then(({actions, isBulk}) => {
      if (!actions.length) {
        return;
      }

      actions.$log = $log;
      actions.$defer = $defer;
      actions.$bulk = isBulk;

      if (isBulk && !$defer) {
        actions.forEach(actn => biStore.dispatch(actn));
      }

      return next(actions).then(result => {
        if (isBulk && $defer) {
          actions.forEach(actn => biStore.dispatch(actn));
        }

        return result;
      });
    });

    if (!action.then) {
      assign(res, isArray(action) ? action[0] : action);
    }

    return res;
  };
}

// allow inversion of control
function functionMiddleware(biStore) {
  return store => next => action => {
    if (typeof action === 'function') {
      return action(biStore)((action as any).$next);
    }

    return next(action);
  };
}

function initBranches(branches: IBranches) {
  const reducers = {};
  const branchMiddlewares = [];

  forEach(branches, (branch, name) => {
    branch((reducer, ...middleware) => {
      reducers[name] = reducer;

      if (middleware.length) {
        branchMiddlewares.push(...middleware);
      }
    });
  });

  return {reducers, middlewares: branchMiddlewares};
}

/**
 * Dispatch an action
 *
 * @param action
 *    - single action
 *    - array of actions or promises (nesting supported)
 *    - promise resolved with any of the above
 */
export const dispatch = storeDispatch => (action) => {
  if (!(action as any).$next) {
    (action as any).$next = actn => dispatch(actn);
  }

  return storeDispatch(action);
}

/**
 * Same as dispatch() but also logs the action to server
 */
export const dispatchAndLog = storeDispatch => <T>(action: T): Promise<T> => {
  (action as any).$log = true;

  if (!(action as any).$next) {
    (action as any).$next = actn => dispatchAndLog(storeDispatch)(actn);
  }

  return dispatch(storeDispatch)(action);
}

/**
 * Same as dispatchAndLog() but dispatching is deferred until after logging the action to server
 */
export const logAndDispatch = storeDispatch => <T>(action: T): Promise<T> => {
  (action as any).$defer = true;
  (action as any).$next = actn => logAndDispatch(storeDispatch)(actn);

  return dispatchAndLog(storeDispatch)(action);
}

export interface StoreOptions {
  logUrl?: string;
  server?: ServerFrameworkType;
}
const defaultStoreOptions: StoreOptions = {
  logUrl: '',
  server: 'Scala'
}
export class Store<S = any> {
  private readonly store: ReduxStore<S>; logger: StoreLogger;
  private readonly options: StoreOptions;

  constructor(branches: IBranches, options: StoreOptions = {}) {
    this.options = {...defaultStoreOptions, ...options};
    const {reducers, middlewares} = initBranches(branches);
    const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;

    this.logger = new StoreLogger(this.options.logUrl, null, this.options.server);
    this.store = Redux.createStore(Redux.combineReducers(reducers), composeEnhancers(Redux.applyMiddleware(...[
      functionMiddleware(this),
      promiseMiddleware(this),
      logMiddleware(this.logger),
      ...middlewares
    ])));

    this.dispatch = dispatch(this.store.dispatch)
    this.dispatchAndLog = dispatchAndLog(this.store.dispatch);
    this.logAndDispatch = logAndDispatch(this.store.dispatch)

  }

  /**
 * Dispatch an action
 *
 * @param action
 *    - single action
 *    - array of actions or promises (nesting supported)
 *    - promise resolved with any of the above
 */
  dispatch: ReturnType<typeof dispatch>;

  /**
   * Same as dispatch() but also logs the action to server
   */
  dispatchAndLog: ReturnType<typeof dispatchAndLog>;

  /**
   * Same as dispatchAndLog() but dispatching is deferred until after logging the action to server
   */
  logAndDispatch: ReturnType<typeof logAndDispatch>

  /**
   * Returns store's state
   *
   * @param branch  e.g. "notebook.folders"
   */
  getState(branch?): S {
    const state = this.store.getState();

    if (branch) {
      return get(state, branch);
    }

    return state;
  }

  /**
   * Subscribe to changes in a particular branch in the store
   * The handler will be executed immediately and every time the branch state reference changes
   *
   * @param branch  e.g. "notebook.folders"
   * @param fn      handler
   */
  subscribe(branch: string, fn: (state, store?) => void, scope): Function {
    const applyScope = scope || inject('$rootScope');
    let state = this.getState(branch);

    scopeUtils.safeDigest(applyScope, () => fn(state, this.store));

    const unsubscribe = this.store.subscribe(() => {
      const newState = this.getState(branch);

      if (newState !== state) {
        scopeUtils.safeDigest(applyScope, () => fn(newState, this));
        state = newState;
      }
    });

    scope.$on('$destroy', unsubscribe);

    return unsubscribe;
  }

  getReduxStore() {
    return this.store;
  }
}

/**
 * Create a new store
 *
 * @param branches  branches to init in the new store
 */
export default function create(branches: IBranches, options?: StoreOptions): Store {
  return new Store(branches, options);
}
