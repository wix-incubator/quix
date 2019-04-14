import {forEach} from 'lodash';
import * as directives from './directives';

function toDirectiveName(name: string) {
  return `bi${name.charAt(0).toUpperCase() + name.slice(1)}`;
}

export default function init(ngApp: angular.IModule) {
  forEach(directives, (fn, name) => ngApp.directive(toDirectiveName(name), fn as any));
}
