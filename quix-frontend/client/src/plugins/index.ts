import {pluginFactory} from './plugin-factory';
import {PluginManager} from '../services/plugins';

export const pluginManager = new PluginManager(pluginFactory);
