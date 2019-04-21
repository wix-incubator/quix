import template from './actions.html';
import './actions.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './actions-types';
import {confirm} from '../../services';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    type: '@',
    context: '<',
    permissions: '<',
    quixActionsOptions: '<',
    onLikeToggle: '&',
    onShare: '&',
    onCopy: '&',
    onDelete: '&'
  },
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({})
        .withOptions('quixActionsOptions', {
          reverse: false,
          list: false,
          confirmOnDelete: true
        }, true)
        .withEvents({
          onLikeToggle() {
            scope.onLikeToggle({context: scope.context});
          },
          onShare() {
            scope.onShare({context: scope.context});
          },
          onCopy() {
            scope.onCopy({context: scope.context});
          },
          onDelete() {
            const fn = () => scope.onDelete({context: scope.context});

            if (!scope.options.confirmOnDelete) {
              fn();
            } else {
              confirm('delete', scope.type, scope.options.list).then(fn);
            }
          }
        });
    }
  }
});
