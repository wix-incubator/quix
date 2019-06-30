import './typings/window';

import {forEach} from 'lodash';
import ngApp from './bootstrap';
import Builder from './services/builder';
import * as directives from './directives';

export {PluginFactory} from './services/builder';
export {default as Instance} from './services/instance';
export {default as App} from './services/instance';
export {default as PluginBuilder} from './services/plugin-instance';

forEach(directives, (fn, name) => ngApp.directive(name, fn as any));

export default function app<Config = any>(id: string | {id: string; title: string; basePath: string}, options: {
  statePrefix?: string;
  defaultUrl?: string;
  auth?: {googleClientId: string};
  homeState?: string;
  logoUrl?: string;
} = {}, modules = []): Builder<Config> {
  return new Builder<Config>(id, ngApp, options, modules);
}
