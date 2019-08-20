import {IAction, IEventData} from '../types';
export abstract class IActionStore {
  abstract pushAction(action: IAction | IAction[]): Promise<IAction[]>;
  abstract get(aggId?: string | string[], orderBy?: string): Promise<IAction[]>;
}
export interface IDBAction<T = IEventData, N extends string = string> {
  id: string;
  user: string;
  dateCreated?: Date;
  type: N;
  data: T;
}
