import {BaseAction} from 'shared/entities/common/common-types';
export interface IEventData {
  [key: string]: any;
}

export interface HasId {
  id: string;
}

interface ServerFields {
  dateCreated?: Date;
  user: string;
}

export type IAction<T = IEventData, N extends string = string> = BaseAction & {
  type: N;
  ethereal?: boolean;
} & T &
  ServerFields;
