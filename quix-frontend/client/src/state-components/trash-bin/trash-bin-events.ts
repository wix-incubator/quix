import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { DeletedNotebookActions, IDeletedNotebook } from '@wix/quix-shared';

export const onPermanentlyDeleteClick = (scope, store: Store, app: App) =>
  (deletedNotebook: IDeletedNotebook) => {
    store.dispatch(DeletedNotebookActions.deleteDeletedNotebook(deletedNotebook.id));
  };
