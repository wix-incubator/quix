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
    history: () => {},
    error: () => {},
    onHistoryClicked: () => {},
    loadMore: () => {
      console.log('empty');
    },
    isLoading: () => {},
  },
  controller: async (scope: HistoryProps, params, { syncUrl, setTitle }) => {
    scope.isLoading = true;
    await cache.history.fetch({ offset: 0, limit: CHUNK_SIZE });
    syncUrl();
    setTitle();

    store.subscribe(
      'history',
      ({ history, error }) => {
        scope.history = [...scope.history ? scope.history : [], ...history];
        scope.isLoading = false;
        scope.loadMore = () => {
          scope.isLoading = true;
          return cache.history.fetch({ offset: scope.history.length, limit: CHUNK_SIZE });
        };
        scope.error = error;
      },
      scope
    );

    scope.onHistoryClicked = onHistoryClick(scope, store, app);
  }
});
