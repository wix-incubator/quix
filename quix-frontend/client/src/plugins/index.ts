import {pluginFactory} from './plugin-factory';
import {PluginManager} from '../services/plugins';
import {hooks} from '../hooks';

export const pluginManager = new PluginManager(pluginFactory, hooks.note);
