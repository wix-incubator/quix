import {RegisterApi, MiddlewareApi} from './api';
import {Context} from './context';
import {
  DefaultAction,
  BaseAction,
} from '../../../../../../shared/entities/common/common-types';

export type EventBusMiddleware = <A extends BaseAction = DefaultAction>(
  action: A,
  api: MiddlewareApi,
  next: EventBusNextFn,
) => any;
export type EventBusNextFn = <A extends BaseAction = DefaultAction>(
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
    call<A extends BaseAction = DefaultAction>(
      name: string,
      action: A,
      extraContext?: Record<string, any>,
    ): Promise<any>;
  };
}

/**** Hooks ****/
export type HookFn<A extends BaseAction = DefaultAction> = (
  action: A,
  api: HookApi,
) => PromiseLike<any> | any;

interface Hook<A extends BaseAction = DefaultAction> {
  name: string;
  fn: HookFn<A>;
}

export interface HookApi {
  context: Context;
}
