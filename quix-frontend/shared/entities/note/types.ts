import {IEntity} from '../common/common-types';

export enum NoteType {
  PRESTO = 'presto',
  NATIVE = 'native',
  ATHENA = 'athena'
}

export interface IBaseNote extends IEntity {
  notebookId: string;
  type: NoteType;
  content: any;
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

export interface IAthenaNote extends IBaseNote {
  type: NoteType.ATHENA;
  content: string;
}

export type INote = INativeNote | IPrestoNote | IAthenaNote;