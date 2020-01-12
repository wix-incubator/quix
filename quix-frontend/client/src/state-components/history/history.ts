import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactStateComponentConfig } from '../../lib/app/services/plugin-builder';
import { History, HistoryProps } from './HistoryComponent';
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
    }
  },
  controller: async (scope: HistoryProps, params, { syncUrl, setTitle }) => {
    await cache.history.fetch({ offset: 0, total: 100 });

    syncUrl();
    setTitle();

    store.subscribe(
      'history',
      ({ history, error }) => {
        scope.history = history;
        scope.loadMore = () => {
          console.log('loading more');
          return cache.history.fetch(20, 40);
        };
        scope.error = error;
      },
      scope
    );

    scope.onHistoryClicked = onHistoryClick(scope, store, app);
  }
});
