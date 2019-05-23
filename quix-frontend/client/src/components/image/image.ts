import template from './image.html';
import './image.scss';

import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './image-types';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  replace: true,
  scope: {
    name: '@'
  },
  link: {
    async pre(scope: IScope) {
      scope.src = `${app.getConfig().staticsBaseUrl}assets/${scope.name}`;
    }
  }
});
