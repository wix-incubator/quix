import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactStateComponentConfig } from '../../lib/app/services/plugin-builder';
import { History, HistoryProps, CHUNK_SIZE } from './HistoryComponent';
import { cache } from '../../store';
import { onHistoryClick } from './history-events';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'history',
  template: History,
  url: {},
  scope: {
    filter: () => {},
    history: () => {},
    error: () => {},
    onHistoryClicked: () => {},
    loadMore: () => {},
  },
  controller: async (scope: HistoryProps, params, { syncUrl, setTitle }) => {
    await cache.history.fetch({ offset: 0, limit: CHUNK_SIZE + 1 }); // TODO: move to makePagination
    syncUrl();
    setTitle();

    store.subscribe(
      'history',
      ({ history, error }) => {
        scope.filter = {user: app.getUser(), query: app.getUser().getEmail()};
        scope.history = [...scope.history ? scope.history : [], ...history]; // TODO: move to makePagination
        scope.loadMore = (offset, limit) => {
          return cache.history.fetch({ offset, limit });
        };
        scope.error = error;
      },
      scope
    );

    scope.onHistoryClicked = onHistoryClick(scope, store, app);
  }
});