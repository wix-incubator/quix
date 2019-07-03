import {Plugin, PluginType, TPluginMap, resolvePluginType} from './plugin-types';

export class PluginManager {
  private readonly plugins: Plugin[] = [];

  addPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  getPluginById<T extends PluginType>(id: string, type: T): TPluginMap[T] {
    const PluginClass = resolvePluginType(type);

    return this.plugins.find(p => p.getId() === id && p instanceof PluginClass) as any;
  }

  getPluginsByType<T extends PluginType>(type: T) {
    const pluginClass = resolvePluginType(type);

    return this.plugins.filter(p => p instanceof pluginClass);
  }

  getPluginIdsByType(type: PluginType) {
    return this.getPluginsByType(type).map(p => p.getId());
  }
}