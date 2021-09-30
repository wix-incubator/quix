import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IDeletedNotebook, TrashBinActions } from '@wix/quix-shared';
import { toast } from '../../lib/ui';

export const onPermanentlyDeleteClick = (scope, store: Store, app: App) => (
  deletedNotebook: IDeletedNotebook
) => {
  store
    .logAndDispatch(
      TrashBinActions.permanentlyDeleteNotebook(deletedNotebook.id)
    )
    .then((action) => {
      console.log(action);
      toast.showToast(
        {
          text: `Notebook deleted.`,
          type: 'success',
        },
        3000
      );
    });
};

export const onRestoreClick = (scope, store: Store, app: App) => (
  deletedNotebook: IDeletedNotebook,
  folderId: string
) => {
  store.logAndDispatch(
    TrashBinActions.restoreDeletedNotebook(deletedNotebook.id, folderId)
  );
};
