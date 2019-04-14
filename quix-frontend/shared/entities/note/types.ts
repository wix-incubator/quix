import {IEntity} from '../common/common-types';

export enum NoteType {
  PRESTO = 'presto',
  NATIVE = 'native'
}

export interface BaseNote extends IEntity {
  notebookId: string;
  type: NoteType;
  content: any;
}

export interface PrestoNote extends BaseNote {
  type: NoteType.PRESTO;
  content: string;
}

export interface NativeNote extends BaseNote {
  type: NoteType.NATIVE;
  content: {queries: string[]};
}

export type INote = NativeNote | PrestoNote;