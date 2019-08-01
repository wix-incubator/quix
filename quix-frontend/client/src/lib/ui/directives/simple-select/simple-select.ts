import template from './simple-select.html';
import './simple-select.scss';

import {DropdownList} from '../common/dropdown-list';

export interface IScope extends ng.IScope {
  model: any[];
}

export default function directive() {
  return {
    template,
    require: ['ngModel', 'biOptions'],
    restrict: 'E',
    transclude: {
      toggle: '?toggle',
      opt: '?opt'
    },
    scope: {
      bsOptions: '=',
      onTypeahead: '&',
      readonly: '=',
      placeholder: '@'
    },

    link: {
      pre(scope: IScope, element, attrs, [ngModel, biOptions], transclude) {
        return new DropdownList(scope, element, attrs, {ngModel, biOptions}, transclude, {
          optionsAlias: 'bsOptions',
        });
      }
    }
  };
}
