import {Plugin, PluginType, TPluginMap, resolvePluginType} from './plugin-types';

export class PluginManager {
  private readonly pool: Plugin[] = [];

  private getPluginById<T extends PluginType>(id: string, type: T): TPluginMap[T] {
    const PluginClass = resolvePluginType(type);

    return this.pool.find(p => p.getId() === id && p instanceof PluginClass) as any;
  }

  private getPluginsByType<T extends PluginType>(type: T) {
    const pluginClass = resolvePluginType(type);

    return this.pool.filter(p => p instanceof pluginClass);
  }

  private getPluginIdsByType<T extends PluginType>(type: T) {
    return this.getPluginsByType(type).map(p => p.getId());
  }

  addPlugin(plugin: Plugin) {
    this.pool.push(plugin);
  }

  get<T extends PluginType>(type: T) {
   return (id: string) => this.getPluginById(id, type);
  }

  all<T extends PluginType>(type: T) {
   return this.getPluginsByType(type);
  }

  ids<T extends PluginType>(type: T) {
   return this.getPluginIdsByType(type);
  }
}