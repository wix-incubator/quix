import {IUser} from './types';
import {ExtractActionTypes, ExtractActions} from '../common/actions';

export const UserActions = {
  createNewUser: (id: string, user: IUser) => ({
    type: 'user.create' as const,
    newUser: user,
    id,
  }),
  updateUser: (id: string, avatar: string, name: string, email: string) => ({
    type: 'user.update' as const,
    name,
    email,
    avatar,
    id,
  }),
}

export type UserActions = ExtractActions<typeof UserActions>
export type UserActionTypes = ExtractActionTypes<typeof UserActions>
export const UserActionTypes = ExtractActionTypes(UserActions);
