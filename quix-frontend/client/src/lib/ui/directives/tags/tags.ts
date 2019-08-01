import template from './tags.html';
import './tags.scss';

import {DropdownList} from '../common/dropdown-list';

export interface IScope extends ng.IScope {
  model: any[];
}

function renderTag(transclude, biOptions, tag) {
  let html;

  if (transclude.isSlotFilled('tag')) {
    html = transclude((_, tscope) => {
      tscope.tag = tag;
    }, null, 'tag');
  } else {
    html = biOptions.render(tag);
  }

  return {html};
}

export default function directive(): ng.IDirective {
  return {
    template,
    require: ['ngModel', 'biOptions'],
    restrict: 'E',
    transclude: {
      tag: '?tag',
      opt: '?opt',
    },
    scope: {
      btOptions: '=',
      onTypeahead: '&',
      readonly: '=',
      placeholder: '@'
    },

    link: {
      pre(scope: IScope, element, attrs, [ngModel, biOptions]: [ng.INgModelController, any], transclude) {
        scope.renderTag = tag => renderTag(transclude, biOptions, tag);

        return new DropdownList(scope, element, attrs, {ngModel, biOptions}, transclude, {
          optionsAlias: 'btOptions',
          isArray: true,
          options: {
            freetext: false,
            typeahead: true,
          }
        });
      }
    }
  };
}
