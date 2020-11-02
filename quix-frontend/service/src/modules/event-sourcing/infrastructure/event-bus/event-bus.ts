import {EventEmitter} from 'events';
import {defer} from 'utils/deferred-promise';
import {
  EventBusMiddlewareDescriptor,
  PluginDescriptor,
  EventBusNextFn,
} from './types';
import {MiddlewareApi} from './api';
import {IAction} from '../types';

/**
 * @name EventBus
 * @description
 * acts as an enhanced event emitter, with the added notion of middlewares, and plugins.
 * - event will be emitted only if all middlewares pass (== don't throw) the event
 * - all middlewares are called for all events, in a row.
 * - every middleware gets the action and can:
 *     ## call the next middleware with next() function
 *     ## can pass a new action to next function
 *     ## can call a "hook" on all registered plugins
 *
 * - a plugin is a collection of hooks - different phases that can be called by middlewares
 *   a hook gets a context object, where it can pass data to the next hook.
 *   use case: avoid fetching data twice, if fetch data from DB on Validation, use it later.
 */
export class EventBus {
  private middlewares: EventBusMiddlewareDescriptor[];

  constructor(
    middlewaresUnsorted: EventBusMiddlewareDescriptor[],
    private plugins: PluginDescriptor[],
    private timeout = 4000,
  ) {
    this.middlewares = middlewaresUnsorted.sort(
      (m1, m2) => m1.priority - m2.priority,
    );
  }
  private emitter = new EventEmitter();

  emit<A extends IAction = IAction>(action: A) {
    const {promise, reject, resolve} = defer();
    const context: any = {};

    const waitForResolution = setTimeout(() => {
      reject(new Error('Event Bus: timeout'));
    }, this.timeout);

    const next = (i: number) => {
      let cachedAction = action;

      return (nextAction?: A | Error) => {
        if (nextAction instanceof Error) {
          reject(nextAction);
          clearTimeout(waitForResolution);
          return;
        }

        cachedAction = nextAction ? nextAction : cachedAction;

        if (i === this.middlewares.length) {
          resolve(cachedAction);
          clearTimeout(waitForResolution);
          return;
        }

        setImmediate(() => {
          const middleware = this.middlewares[i];
          try {
            const api = new MiddlewareApi(this.plugins, context);
            middleware.fn(cachedAction, api, next(i + 1) as EventBusNextFn);
          } catch (e) {
            reject(e);
            clearTimeout(waitForResolution);
          }
        });
      };
    };

    next(0)(action);

    return promise.then((finalAction: A) => {
      this.emitter.emit(finalAction.type, finalAction);
    });
  }

  on(type: string, handler: (...args: any[]) => any) {
    this.emitter.on(type, handler);
  }
}
