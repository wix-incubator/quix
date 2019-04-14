import {forEach} from 'lodash';
import * as directives from './directives';
import * as filters from './filters';

const excluded = ['contenteditable'];

function toDirectiveName(name: string) {
  if (excluded.indexOf(name) !== -1) {
    return name;
  }

  return `bi${name.charAt(0).toUpperCase() + name.slice(1)}`;
}

export default function init(ngApp: angular.IModule) {
  forEach(directives, (fn, name) => ngApp.directive(toDirectiveName(name), fn as any));
  forEach(filters, (fn, name) => ngApp.filter(name, fn as any));
}
