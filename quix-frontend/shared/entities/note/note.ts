import uuid from 'uuid/v4';
import {INote, NoteType} from './types';

export const createNote = (notebookId: string, props: Partial<INote> = {}): INote => ({
  id: uuid(),
  notebookId,
  name: 'New note',
  type: NoteType.PRESTO,
  content: '\n',
  owner: '',
  dateCreated: Date.now(),
  dateUpdated: Date.now(),
  ...props as any
});
