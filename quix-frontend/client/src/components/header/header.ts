import template from './header.html';
import './header.scss';
import { isArray } from 'lodash';
import { initNgScope } from '../../lib/core';
import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IScope } from './header-types';
import { HeaderMenu } from '../../config';
import * as AppActions from '../../store/app/app-actions';
import { hooks } from '../../hooks';

const listenToNavChange = (scope: IScope, app: App, store: Store) => {
  const { navItems } = scope.vm;

  const states = navItems.reduce((res, item) => {
    return [...res, ...(item.activeStates || [item.targetState])];
  }, []);

  app.getNavigator()
    .listen(states, 'success', async (params, state) => {
      const menuItem = navItems.find(item => {
        return (item.targetState === state || (item.activeStates && item.activeStates.indexOf(state) !== -1));
      });

      const procede = await (menuItem && (!menuItem.activeCondition || menuItem.activeCondition(app, store, state, params.id)));

      scope.vm.currentState = procede ? menuItem.targetState : null;
    }, scope)
    .otherwise(() => scope.vm.currentState = null);
}

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: IScope) {
      initNgScope(scope)
        .withVM({
          searchText: null,
          currentState: null,
          navItems: HeaderMenu(scope)
        })
        .withEvents({
          onSearch() {
            store.dispatch(AppActions.setInputSearchText(scope.vm.searchText || null));
          },
          onNavItemClick(item) {
            app.go(item.targetState, { id: null });
          }
        });

      const additionalItems = hooks.header.additionalItems.call(app, store);
      scope.vm.additionalItems = isArray(additionalItems) ? additionalItems[0] : null;

      listenToNavChange(scope, app, store);

      store.subscribe('app.inputSearchText', text => scope.vm.searchText = text, scope);
    }
  }
});
