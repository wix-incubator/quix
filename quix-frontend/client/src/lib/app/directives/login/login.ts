import template from './login.html';
import './login.scss';

import {initNgScope, utils} from '../../../core';
import {App} from '../..';

export interface IScope extends ng.IScope {
  app: App;
}

export default () => {
  return {
    restrict: 'E',
    template,
    scope: {
      app: '='
    },
    link: {
      pre(scope: IScope) {
        initNgScope(scope)
          .withVM({
            pending: {}
          })
          .withEvents({
            onLoginClick() {
              scope.vm.pending.toggle(true);

              scope.app.login()
                .catch(() => utils.scope.safeDigest(scope, () => scope.vm.pending.toggle(false)));
            }
          });
      }
    }
  };
};
