import {RegisterApi} from './api';
import {
  EventBusMiddleware,
  EventBusMiddlewareDescriptor,
  PluginDescriptor,
  EventBusPluginFn,
  defaultPluginDescriptor,
  EventBusPlugin,
} from './types';
import {EventBus} from './event-bus';
import {Dictionary} from '../../../../types';

interface AddPluginOptions {
  priority?: number;
}

const isPlugin = (obj: any): obj is EventBusPlugin =>
  typeof obj.name === 'string' && typeof obj.registerFn === 'function';

export const EventBusBuilder = () => new EventBusBuilderT();

class EventBusBuilderT {
  private middlewares: EventBusMiddlewareDescriptor[] = [];
  private plugins: PluginDescriptor[] = [];

  addPlugin(
    plugins: Dictionary<EventBusPlugin> | EventBusPlugin,
  ): EventBusBuilderT;
  addPlugin(name: string, registerCB: EventBusPluginFn): EventBusBuilderT;

  addPlugin(
    arg1: string | Dictionary<EventBusPlugin> | EventBusPlugin,
    registerCB?: EventBusPluginFn,
  ) {
    let plugins: Dictionary<EventBusPlugin> = {};
    if (typeof arg1 === 'string') {
      plugins = registerCB
        ? {[arg1]: {name: arg1, registerFn: registerCB}}
        : {};
    } else {
      if (isPlugin(arg1)) {
        plugins = {[arg1.name]: arg1};
      } else {
        /* dictionary of plugins */
        plugins = arg1;
      }
    }

    Object.entries(plugins).forEach(([_, plugin]) => {
      const pluginDescriptor = defaultPluginDescriptor(plugin.name);
      const api = new RegisterApi(pluginDescriptor);
      plugin.registerFn(api);
      this.plugins.push(pluginDescriptor);
    });
    return this;
  }

  addMiddleware(
    middleware: EventBusMiddleware,
    options: AddPluginOptions = {},
  ) {
    let {priority} = options;
    priority = this.computeMiddlewarePriority(priority);

    this.middlewares.push({fn: middleware, priority});
    return this;
  }

  private computeMiddlewarePriority(priority?: number) {
    priority =
      typeof priority === 'number'
        ? priority
        : (Object.keys(this.middlewares).length > 0
            ? Math.max.apply(
                null,
                this.middlewares.map(m => m.priority),
              )
            : 0) + 1;
    return priority;
  }

  build(options: {timeout: number} = {timeout: 30000}) {
    return new EventBus(this.middlewares, this.plugins, options.timeout);
  }
}
