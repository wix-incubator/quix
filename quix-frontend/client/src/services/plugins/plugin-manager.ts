import {App} from '../../lib/app';
import {TModuleComponentType, ModuleEngineType} from '@wix/quix-shared';
import {Plugin, TPluginMap, resolvePluginType} from './plugin-types';
import { Store } from '../../lib/store';

export class PluginManager<H> {
  private readonly pool: Plugin[] = [];

  constructor(private readonly pluginFactory: any, public readonly hooks: H) {}

  private getPluginById<T extends TModuleComponentType>(
    id: string,
    type: T,
  ): TPluginMap[T] {
    const PluginClass = resolvePluginType(type);

    return this.pool.find(
      p => p.getId() === id && p instanceof PluginClass,
    ) as any;
  }

  private getPluginsByType<T extends TModuleComponentType>(
    type: T,
  ): TPluginMap[T][] {
    const PluginClass = resolvePluginType(type);

    return this.pool.filter(p => p instanceof PluginClass) as any;
  }

  module<T extends TModuleComponentType>(type: T) {
    return {
      plugin: (id: string, engine?: ModuleEngineType, app?: App, store?: Store) => {
        if (engine) {
          const plugin = this.pluginFactory[type](app, store, id, engine, this.hooks);

          if (plugin) {
            this.pool.push(plugin);
          }
        }

        return (
          this.getPluginById(id, type) || this.getPluginById('default', type)
        );
      },

      plugins: () => {
        return this.getPluginsByType(type);
      },
    };
  }
}
