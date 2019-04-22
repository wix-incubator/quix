import template from './breadcrumbs.html';
import './breadcrumbs.scss';

import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './breadcrumbs-types';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {
    breadcrumbs: '<',
    quixBreadcrumbsOptions: '<',
    readonly: '<',
    onFolderClick: '&',
    onNameChange: '&'
  },
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withOptions('quixBreadcrumbsOptions', {
          focusName: false,
        })
        .withVM({})
        .withEvents({
          onFolderClick(file, index) {
            scope.onFolderClick({file, isRoot: index === 0});
          },
          onNameChange(file) {
            scope.onNameChange({file});
          }
        });
    }
  }
});
