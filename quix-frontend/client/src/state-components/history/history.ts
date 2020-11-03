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
    resultsLeft: ()  => {},
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
        scope.resultsLeft = scope.resultsLeft === false ? false : true;
        scope.loadMore = async () => {
          scope.isLoading = true;
          const response = await cache.history.fetch({ offset: scope.history.length, limit: CHUNK_SIZE });
          if (response.length !== CHUNK_SIZE) {
            scope.resultsLeft = false;
          }
          return response;
        };
        scope.error = error;
      },
      scope
    );

    scope.onHistoryClicked = onHistoryClick(scope, store, app);
  }
});
