import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IReactStateComponentConfig } from '../../lib/app/services/plugin-builder';
import { TrashBin, TrashBinProps } from './TrashBinComponent';
import { cache } from '../../store';
import { onPermanentlyDeleteClick } from "./trash-bin-events";
import _noop from 'lodash/noop';

export default (app: App, store: Store): IReactStateComponentConfig => ({
  name: 'trashBin',
  template: TrashBin,
  url: {},
  scope: {
    deletedNotebooks: _noop,
    error: _noop,
    //todo onDelete
    onPermanentlyDeleteClicked: _noop
  },
  controller: async (scope: TrashBinProps, params) => {
    await cache.deletedNotebooks.fetch(params.id);

    store.subscribe(
      'deletedNotebooks',
      ({ deletedNotebooks, error }) => {
        scope.deletedNotebooks = deletedNotebooks;
        scope.error = error;
      },
      scope
    );

    scope.onPermanentlyDeleteClicked = onPermanentlyDeleteClick(scope, store, app);
  },
});
