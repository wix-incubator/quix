import { TModuleComponentType, ModuleEngineType } from '../../../../shared/dist';
import { Plugin, TPluginMap, resolvePluginType } from './plugin-types';

export class PluginManager<H> {
  private readonly pool: Plugin[] = [];

  constructor(private readonly pluginFactory: any, public readonly hooks: H) { }

  private getPluginById<T extends TModuleComponentType>(id: string, type: T): TPluginMap[T] {
    const PluginClass = resolvePluginType(type);

    return this.pool.find(p => p.getId() === id && p instanceof PluginClass) as any;
  }

  private getPluginsByType<T extends TModuleComponentType>(type: T) {
    const pluginClass = resolvePluginType(type);

    return this.pool.filter(p => p instanceof pluginClass);
  }

  module<T extends TModuleComponentType>(type: T) {
    return {
      plugin: (id: string, engine?: ModuleEngineType) => {
        if (engine) {
          this.pool.push(this.pluginFactory[type](id, engine, this.hooks));
        }
          
        return this.getPluginById(id, type);
      },

      plugins: () => {
        return this.getPluginsByType(type)
      }
    };
  }
}