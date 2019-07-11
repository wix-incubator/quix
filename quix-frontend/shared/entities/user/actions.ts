import {IUser} from './types';
import {ExtractActionTypes, ExtractActions} from '../common/actions';

export const UserActions = {
  createUser: (id: string, notebook: IUser) => ({
    type: 'notebook.create' as const,
    notebook,
    id,
  }),
}

export type NotebookActions = ExtractActions<typeof UserActions>
export type NotebookActionTypes = ExtractActionTypes<typeof UserActions>
export const NotebookActionTypes = ExtractActionTypes(UserActions);
