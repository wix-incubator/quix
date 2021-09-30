import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactStateComponentConfig } from '../../lib/app/services/plugin-builder';
import { TrashBin, TrashBinProps } from './TrashBinComponent';
import { cache } from '../../store';
import { onPermanentlyDeleteClick, onRestoreClick } from './trash-bin-events';
import _noop from 'lodash/noop';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'trashBin',
  template: TrashBin,
  url: {},
  scope: {
    deletedNotebooks: _noop,
    error: _noop,
    onPermanentlyDeleteClicked: _noop,
    onRestoreClicked: _noop,
  },
  controller: async (scope: TrashBinProps, params, { syncUrl, setTitle }) => {
    syncUrl();
    setTitle();

    scope.onPermanentlyDeleteClicked = onPermanentlyDeleteClick(
      scope,
      store,
      app
    );

    scope.onRestoreClicked = onRestoreClick(scope, store, app);

    await cache.deletedNotebooks.fetch(params.id);

    store.subscribe(
      'deletedNotebooks',
      ({ deletedNotebooks, error }) => {
        scope.deletedNotebooks = deletedNotebooks;
        scope.error = error;
      },
      scope
    );
  },
});
