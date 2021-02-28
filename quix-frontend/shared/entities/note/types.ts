import {IEntity} from '../common/common-types';

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export interface IBaseNote extends Omit<IEntity, 'ownerDetails'> {
  notebookId: string;
  type: string;
  content: string;
  richContent?: Record<string, any>,
  owner: string;
}

export type INote = IBaseNote;