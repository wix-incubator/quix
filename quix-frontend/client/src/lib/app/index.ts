import './typings/window';
import {forEach} from 'lodash';
import {ngApp} from './bootstrap';
import {Builder} from './services/builder';
import * as directives from './directives';
import {Options} from './types';

export {App} from './services/app';
export {PluginBuilder} from './services/plugin-builder';

forEach(directives, (fn, name) => ngApp.directive(name, fn as any));

export default function app<Config = any>(id: string | {
  id: string;
  title: string;
}, options: Options = {}, modules = []): Builder<Config> {
  return new Builder<Config>(id, ngApp, options, modules);
}
