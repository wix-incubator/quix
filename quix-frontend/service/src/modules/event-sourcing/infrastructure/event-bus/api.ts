import {
  HookFn,
  IPluginApi as IMiddlewareApi,
  HookApi,
  PluginDescriptor,
  EventFilter,
  PluginOptions,
} from './types';
import {ContextFactory} from './context';
import {Dictionary} from '../../../../types';
import {IAction} from '../types';

export class RegisterApi {
  constructor(private descriptor: PluginDescriptor) {}
  hooks = {
    listen: <A extends IAction = IAction>(
      name: string,
      fn: HookFn<A>,
    ): RegisterApi => {
      this.descriptor.hooks.set(name, {name, fn});
      return this;
    },
  };
  setPluginOptions(options: PluginOptions) {
    Object.assign(this.descriptor.options, options);
    return this;
  }
  setEventFilter(fn: EventFilter) {
    this.descriptor.eventFilter = fn;
  }
}

export class MiddlewareApi implements IMiddlewareApi {
  private contextFactory: ContextFactory;

  constructor(
    private plugins: PluginDescriptor[],
    baseContext: Dictionary<any>,
  ) {
    this.contextFactory = new ContextFactory(baseContext);
  }

  hooks = {
    call: <A extends IAction = IAction>(
      name: string,
      action: A,
      extraContext?: Dictionary<any>,
    ) => {
      const promises = this.plugins
        .filter(plugin => plugin.eventFilter(action.type))
        .map(plugin => {
          const hook = plugin.hooks.get(name);

          if (hook) {
            const hookApi: HookApi = {
              context: this.contextFactory.setExtra(extraContext).create(),
            };

            try {
              return Promise.resolve(hook.fn(action, hookApi));
            } catch (e) {
              return Promise.reject(e);
            }
          }
          return Promise.resolve(action);
        });
      return Promise.all(promises);
    },
  };
}
