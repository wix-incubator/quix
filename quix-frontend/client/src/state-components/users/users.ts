import {Store} from '../../lib/store';
import {App} from '../../lib/app';
import {IReactStateComponentConfig} from '../../lib/app/services/plugin-builder';
import {Users, UsersProps} from './UsersComponent';
import {cache} from '../../store';
import {onUserClick} from './users-events';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'users',
  template: Users,
  url: {},
  scope: {
    users: () => {},
    error: () => {},
    onUserClicked: () => {}
  },
  controller: async (scope: UsersProps, params, {syncUrl, setTitle}) => {
    await cache.users.fetch(params.id);

    syncUrl();
    setTitle();

    store.subscribe(
      'users',
      ({users, error}) => {
        scope.users = users;
        scope.error = error;
      },
      scope
    );

    scope.onUserClicked = onUserClick(scope, store, app);
  },
});
