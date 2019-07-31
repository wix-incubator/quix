import {IEntity} from '../common/common-types';

export interface IBaseNote extends IEntity {
  notebookId: string;
  type: string;
  content: any;
  rank?: number; //TODO: TEMP, SHOULD BE REMOVED @aviad
}

export type INote = IBaseNote;