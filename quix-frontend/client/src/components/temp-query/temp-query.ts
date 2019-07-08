import template from './temp-query.html';
import './temp-query.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './temp-query-types';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    type: '<',
    code: '<',
    autorun: '<'
  },
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({})
        .withEvents({
          onRunnerInstanceLoad(instance) {
            if (scope.autorun) {
              instance.run();
            }
          }
        });
    }
  }
});
