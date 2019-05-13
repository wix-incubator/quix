import template from './header.html';
import './header.scss';
import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './header-types';
import * as AppActions from '../../store/app/app-actions';

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          searchText: null
        })
        .withEvents({
          onSearch() {
            store.dispatch(AppActions.search(scope.vm.searchText || null, 'user'));
          },
          onFavoritesClick() {
            app.getNavigator().go('base.favorites');
          },
        });

      store.subscribe('app.searchText', text => scope.vm.searchText = text, scope);  
    }
  }
});
