import template from './meta.html';
import './meta.scss';

import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './meta-types';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    entity: '<'
  },
  link: {
    async pre(scope: IScope) {
      return;
    }
  }
});
