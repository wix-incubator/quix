import { ExtractActionTypes, ExtractActions } from '../common/actions';

export const TrashBinActions = {
  moveNotebookToTrashBin: (id: string) => ({
    type: 'trashBin.addNotebook' as const,
    id,
  }),

  moveFolderToTrashBin: (id: string) => ({
    type: 'trashBin.addFolderContent' as const,
    id,
  }),

  permanentlyDeleteNotebook: (id: string) => ({
    type: 'trashBin.deleteNotebook' as const,
    id,
  }),

  restoreDeletedNotebook: (id: string, folderId: string) => ({
    type: 'trashBin.restoreNotebook' as const,
    folderId,
    id,
  }),
};

export type TrashBinActions = ExtractActions<typeof TrashBinActions>;
export type TrashBinActionTypes = ExtractActionTypes<typeof TrashBinActions>;
export const TrashBinActionTypes = ExtractActionTypes(TrashBinActions);
