import template from './header.html';
import './header.scss';
import {initNgScope} from '../../lib/core';
import {Store} from '../../lib/store';
import {Instance} from '../../lib/app';
import {IScope} from './header-types';
import {HeaderNavItems} from '../../constants';
import * as AppActions from '../../store/app/app-actions';

const listenToNavChange = (scope: IScope, app: Instance) => {
  const states = HeaderNavItems.reduce((res, item) => {
    return [...res, ...(item.activeStates || [item.targetState]).map(state => `base.${state}`)];
  }, []);

  app.getNavigator()
    .listen(states, 'success', (params, state) => {
      state = state.replace('base.', '');
      scope.vm.currentState = HeaderNavItems.find(item => item.targetState === state || (item.activeStates && item.activeStates.indexOf(state) !== -1)).targetState;
    }, scope)
    .otherwise(() => scope.vm.currentState = null);
}

export default (app: Instance, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          searchText: null,
          currentState: null,
          navItems: HeaderNavItems
        })
        .withEvents({
          onSearch() {
            store.dispatch(AppActions.search(scope.vm.searchText || null, 'user'));
          },
          onNavItemClick(item) {
            app.go(`base.${item.targetState}`);
          }
        });

      listenToNavChange(scope, app);

      store.subscribe('app.searchText', text => scope.vm.searchText = text, scope);
    }
  }
});
