import { AsyncSeriesHook } from 'tapable';
import {pluginFactory} from './plugin-factory';
import {PluginManager} from '../services/plugins';

export const pluginManager = new PluginManager(pluginFactory, {
  import: new AsyncSeriesHook(['store', 'note', 'value']),
});
