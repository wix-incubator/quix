import template from './breadcrumbs.html';
import './breadcrumbs.scss';

import {initNgScope} from '../../../core';

export default function directive() {
  return {
    template,
    require: 'biOptions',
    restrict: 'E',
    transclude: true,
    scope: {
      onItemClick: '&'
    },

    link: {
      pre(scope, element, attrs, biOptions, transclude) {
        initNgScope(scope)
          .withEvents({
            onItemClick(item) {
              scope.onItemClick({item: biOptions.format(item)});
            }
          });

        scope.renderItem = (item, index) => {
          let html = transclude((_, _scope) => {
            _scope.item = item;
            _scope.$index = index;
          });

          html = html.text().trim().length ? html : biOptions.render(item);

          return {html};
        };

        biOptions.watch(collection => {
          scope.collection = collection;
        });
      }
    }
  };
}
