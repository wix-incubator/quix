import { IDeletedNotebook } from './types';
import { ExtractActionTypes, ExtractActions } from '../common/actions';

export const DeletedNotebookActions = {
  createDeletedNotebook: (id: string, deletedNotebook: IDeletedNotebook) => ({
    type: 'deletedNotebook.create' as const,
    deletedNotebook,
    id,
  }),

  deleteDeletedNotebook: (id: string) => ({
    type: 'deletedNotebook.delete' as const,
    id,
  }),

  restoreDeletedNotebook: (id: string) => ({
    type: 'deletedNotebook.restore' as const,
    id,
  }),
};

export type DeletedNotebookActions = ExtractActions<
  typeof DeletedNotebookActions
>;
export type DeletedNotebookActionTypes = ExtractActionTypes<
  typeof DeletedNotebookActions
>;
export const DeletedNotebookActionTypes = ExtractActionTypes(
  DeletedNotebookActions
);
