import {IEntity} from '../common/common-types';

export enum NoteType {
  PRESTO = 'presto',
  NATIVE = 'native'
}
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export interface IBaseNote extends Omit<IEntity, 'ownerDetails'> {
  notebookId: string;
  type: NoteType;
  content: any;
  owner: string;
  rank?: number; //TODO: TEMP, SHOULD BE REMOVED @aviad
}

export interface IPrestoNote extends IBaseNote {
  type: NoteType.PRESTO;
  content: string;
}

export interface INativeNote extends IBaseNote {
  type: NoteType.NATIVE;
  content: {queries: string[]};
}

export type INote = INativeNote | IPrestoNote;