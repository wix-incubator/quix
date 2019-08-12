import { AsyncSeriesHook } from 'tapable';
import { TModuleComponentType, ModuleEngineType } from '../../../../shared/dist';
import { Plugin, TPluginMap, resolvePluginType } from './plugin-types';

export class PluginManager {
  private readonly pool: Plugin[] = [];
  public readonly hooks = {
    import: new AsyncSeriesHook(['store', 'note', 'questionId']),
  };

  constructor(private readonly pluginFactory: any) { }

  private getPluginById<T extends TModuleComponentType>(id: string, type: T): TPluginMap[T] {
    const PluginClass = resolvePluginType(type);

    return this.pool.find(p => p.getId() === id && p instanceof PluginClass) as any;
  }

  private getPluginsByType<T extends TModuleComponentType>(type: T) {
    const pluginClass = resolvePluginType(type);

    return this.pool.filter(p => p instanceof pluginClass);
  }

  private getPluginIdsByType<T extends TModuleComponentType>(type: T) {
    return this.getPluginsByType(type).map(p => p.getId());
  }

  add<T extends TModuleComponentType>(type: T) {
    return (id: string, engine: ModuleEngineType) => this.pool.push(this.pluginFactory[type](id, engine, this.hooks));
  }

  get<T extends TModuleComponentType>(type: T) {
   return (id: string) => this.getPluginById(id, type);
  }

  all<T extends TModuleComponentType>(type: T) {
   return this.getPluginsByType(type);
  }

  ids<T extends TModuleComponentType>(type: T) {
   return this.getPluginIdsByType(type);
  }
}