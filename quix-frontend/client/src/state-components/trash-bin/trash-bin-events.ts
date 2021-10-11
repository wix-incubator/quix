import { Store } from '../../lib/store';
import { App } from '../../lib/app';
import { IDeletedNotebook, TrashBinActions } from '@wix/quix-shared';
import { toast } from '../../lib/ui';
import { prompt } from '../../services/dialog';

export const onPermanentlyDeleteClick = (scope, store: Store, app: App) => (
  deletedNotebook: IDeletedNotebook
) => {
  store
    .logAndDispatch(
      TrashBinActions.permanentlyDeleteNotebook(deletedNotebook.id)
    )
    .then((action) => {
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
  let restoreFolder = '';
  prompt(
    {
      title: 'Restore notebook',
      subTitle: 'Choose destination folder',
      yes: 'restore',
      content: `<quix-destination-picker ng-model="model.folder" context="folder" required></quix-destination-picker>`,
      onConfirm: ({ model: { folder } }) => {
        restoreFolder = folder.name;
        return store.logAndDispatch(
          TrashBinActions.restoreDeletedNotebook(deletedNotebook.id, folder.id)
        );
      },
    },
    scope,
    { model: { folder: null } }
  ).then((res) => {
    return toast.showToast(
      {
        text: `Restored To "${restoreFolder}."`,
        type: 'success',
      },
      3000
    );
  });
};
