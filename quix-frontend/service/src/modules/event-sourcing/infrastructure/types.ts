export interface IEventData {
  [key: string]: any;
}

export interface HasId {
  id: string;
}

interface ServerFields {
  dateCreated?: Date;
  user?: string;
}

export type IAction<T = IEventData, N = string> = {
  type: N;
  id: string;
} & T &
  ServerFields;
