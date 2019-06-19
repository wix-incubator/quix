import {INotebook} from './types';
import {ExtractActionTypes, ExtractActions} from '../common/actions';
import {IFilePathItem} from '../file';

export const NotebookActions = {
  createNotebook: (id: string, notebook: INotebook) => ({
    type: 'notebook.create' as const,
    notebook,
    id,
  }),

  deleteNotebook: (id: string) => ({
    type: 'notebook.delete' as const,
    id
  }),

  moveNotebook: (id: string, newPath: IFilePathItem[]) => ({
    type: 'notebook.update.path' as const,
    id,
    path: newPath
  }),

  updateName: (id: string, name: string) => ({
    type: 'notebook.update.name' as const,
    name,
    id
  }),

  toggleIsLiked: (id: string, isLiked: boolean) => ({
    type: 'notebook.update.isLiked' as const,
    id,
    isLiked
  }),
}

export type NotebookActions = ExtractActions<typeof NotebookActions>
export type NotebookActionTypes = ExtractActionTypes<typeof NotebookActions>
export const NotebookActionTypes = ExtractActionTypes(NotebookActions);
