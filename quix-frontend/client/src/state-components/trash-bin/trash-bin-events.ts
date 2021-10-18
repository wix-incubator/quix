import { Store } from '../../lib/store';
import { IDeletedNotebook, TrashBinActions } from '@wix/quix-shared';
import { toast } from '../../lib/ui';
import { confirmAction, prompt } from '../../services/dialog';

export const onPermanentlyDeleteClick = (store: Store) => (
  deletedNotebook: IDeletedNotebook
) => {
  confirmAction('delete', 'notebook', deletedNotebook, '', () => {
    store
      .logAndDispatch(
        TrashBinActions.permanentlyDeleteNotebook(deletedNotebook.id)
      )
      .then(() => successToast(`"${deletedNotebook.name}" Notebook deleted.`));
  });
};

export const onEmptyTrashBinClicked = (scope, store: Store) => () => {
  confirmAction('delete', 'notebook', scope.deletedNotebooks, '', () => {
    store
      .dispatchAndLog(
        scope.deletedNotebooks.map((n) =>
          TrashBinActions.permanentlyDeleteNotebook(n.id)
        )
      )
      .then(() => successToast(`Trash Bin is Empty.`));
  });
};

export const onRestoreClick = (scope, store: Store) => (
  deletedNotebook: IDeletedNotebook
) => {
  let restoreFolder = '';

  prompt(
    {
      title: 'Restore notebook',
      subTitle: 'Choose destination folder',
      yes: 'restore',
      content: /*html*/ `
      <quix-destination-picker 
        ng-model="model.folder" 
        context="folder" 
        required="true"
      ></quix-destination-picker>`,
      onConfirm: ({ model: { folder } }) => {
        restoreFolder = folder.name;
        return store.logAndDispatch(
          TrashBinActions.restoreDeletedNotebook(deletedNotebook.id, folder.id)
        );
      },
    },
    scope,
    { model: { folder: null } }
  ).then(() => successToast(`Restored to "${restoreFolder}."`));
};

function successToast(text: string) {
  toast.showToast(
    {
      text,
      type: 'success',
    },
    3000
  );
}
