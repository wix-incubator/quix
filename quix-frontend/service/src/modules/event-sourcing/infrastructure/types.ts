import {BaseAction} from '@wix/quix-shared/entities/common/common-types';
export interface IEventData {
  [key: string]: any;
}

export interface HasId {
  id: string;
}

interface ServerFields {
  dateCreated?: Date;
  user: string;
  userId?: string;
  sessionId?: string;
}

export type IAction<T = IEventData, N extends string = string> = BaseAction & {
  type: N;
  ethereal?: boolean;
  syncClients?: boolean;
} & T &
  ServerFields;
