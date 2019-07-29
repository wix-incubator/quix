import template from './meta.html';
import './meta.scss';

import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IScope} from './meta-types';

export default (app: App, store: Store) => () => ({
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
