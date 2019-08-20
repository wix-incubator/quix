import {RegisterApi, MiddlewareApi} from './api';
import {Context} from './context';
import {IAction} from '../types';

export type EventBusMiddleware = <A extends IAction = IAction>(
  action: A,
  api: MiddlewareApi,
  next: EventBusNextFn,
) => any;
export type EventBusNextFn = <A extends IAction = IAction>(
  action?: A | Error,
) => void;
export type EventBusPluginFn = (api: RegisterApi) => void;
export interface EventBusPlugin {
  name: string;
  registerFn: EventBusPluginFn;
}

/**** Middleware  ****/
export interface EventBusMiddlewareDescriptor {
  fn: EventBusMiddleware;
  priority: number;
}

/**** Plugins ****/
export type EventFilter = (type: string) => boolean;

export interface PluginDescriptor {
  name: string;
  eventFilter: EventFilter;
  options: PluginOptions;
  hooks: Map<string, Hook<any>>;
}
export const defaultPluginDescriptor = (name: string): PluginDescriptor => ({
  name,
  eventFilter: () => true,
  options: {
    isTransaction: true,
  },
  hooks: new Map(),
});

export interface PluginOptions {
  isTransaction: boolean;
}

export type Plugins = Map<string, PluginDescriptor>;

/**** PluginApi ****/
export interface IPluginApi {
  hooks: {
    call<A extends IAction = IAction>(
      name: string,
      action: A,
      extraContext?: Record<string, any>,
    ): Promise<any>;
  };
}

/**** Hooks ****/
export type HookFn<A extends IAction = IAction> = (
  action: A,
  api: HookApi,
) => PromiseLike<any> | any;

interface Hook<A extends IAction = IAction> {
  name: string;
  fn: HookFn<A>;
}

export interface HookApi {
  context: Context;
}
