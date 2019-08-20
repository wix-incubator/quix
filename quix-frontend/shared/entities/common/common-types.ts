import {IUser} from '../user';

export interface IEntity {
  id: string;
  name: string;
  owner: string
  ownerDetails?: IUser
  dateCreated: number;
  dateUpdated: number;
}

export interface BaseAction {
  type: string;
  id: string;
}

export interface AnyAction extends BaseAction {
  type: string;
  [k: string]: any
}

export type Reducer<S, A extends BaseAction = AnyAction> = (state: S | undefined, action: A) => (S | undefined);

