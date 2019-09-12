import { App } from '../../lib/app';
import { TModuleComponentType, ModuleEngineType } from '@wix/quix-shared';
import { Plugin, TPluginMap, resolvePluginType } from './plugin-types';

export class PluginManager<H> {
  private readonly pool: Plugin[] = [];

  constructor(private readonly pluginFactory: any, public readonly hooks: H) { }

  private getPluginById<T extends TModuleComponentType>(id: string, type: T): TPluginMap[T] {
    const PluginClass = resolvePluginType(type);

    return this.pool.find(p => p.getId() === id && p instanceof PluginClass) as any;
  }

  private getPluginsByType<T extends TModuleComponentType>(type: T): TPluginMap[T][] {
    const PluginClass = resolvePluginType(type);

    return this.pool.filter(p => p instanceof PluginClass) as any;
  }

  module<T extends TModuleComponentType>(type: T) {
    return {
      plugin: (id: string, engine?: ModuleEngineType, app? :App,) => {
        if (engine) {
          this.pool.push(this.pluginFactory[type](app, id, engine, this.hooks));
        }
          
        return this.getPluginById(id, type);
      },

      plugins: () => {
        return this.getPluginsByType(type)
      }
    };
  }
}