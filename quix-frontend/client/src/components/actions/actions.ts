import template from './actions.html';
import './actions.scss';

import {isArray} from 'lodash';
import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './actions-types';
import {confirmAction} from '../../services';

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    type: '@',
    context: '<',
    permissions: '<',
    quixActionsOptions: '<',
    custom: '<',
    onLikeToggle: '&',
    onShare: '&',
    onClone: '&',
    onDelete: '&'
  },
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({})
        .withOptions('quixActionsOptions', {
          reverse: false,
          compact: false,
          customText: '',
          confirmOnDelete: true,
          bulk: isArray(scope.context),
        }, true)
        .withOptions('custom', {
          actions: [],
          handler: () => {},
        })
        .withEvents({
          onLikeToggle() {
            scope.onLikeToggle({context: scope.context});
          },
          onShare() {
            scope.onShare({context: scope.context});
          },
          onClone() {
            scope.onClone({context: scope.context});
          },
          onDelete() {
            const fn = () => scope.onDelete({context: scope.context});

            if (!scope.options.confirmOnDelete) {
              fn();
            } else {
              confirmAction('delete', scope.type, scope.context, scope.options.customText).then(fn);
            }
          }
        });
    }
  }
});
