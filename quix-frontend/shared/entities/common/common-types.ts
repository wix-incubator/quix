import {IUser} from '../user';

export interface IEntity {
  id: string;
  name: string;
  owner: string
  ownerDetails?: IUser
  dateCreated: number;
  dateUpdated: number;
}

//TODO: use actual Types
export interface BaseAction {
  type: string;
  id: string;
}

export interface DefaultAction extends BaseAction {
  type: string;
  [k: string]: any
}

export type Reducer<S, A extends BaseAction = DefaultAction> = (state: S | undefined, action: A) => (S | undefined);

