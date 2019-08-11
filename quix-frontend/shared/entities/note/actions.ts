import {ExtractActionTypes, ExtractActions} from '../common/actions';
import {INote} from './types';

export const NoteActions = {
  updateName: (id: string, name: string) => ({
    type: 'note.update.name' as const,
    name,
    id
  }),

  updateContent: (id: string, content: any) => ({
    type: 'note.update.content' as const,
    id,
    content
  }),

  move: (id: string, newNotebookId: string) => ({
    type: 'note.move' as const,
    id,
    newNotebookId
  }),

  addNote: (id: string, note: INote) => {
    return {
      type: 'note.create' as const,
      id,
      note
    };
  },

  deleteNote: (id: string) => ({
    type: 'note.delete' as const,
    id
  }),

  reorderNote: (id: string, to: number) => ({
    type: 'note.reorder' as const,
    id,
    to
  }),
}

export type NoteActions = ExtractActions<typeof NoteActions>;
export type NoteActionT<T extends NoteActionTypes> = NoteActions & {type: T};
export type NoteActionTypes = ExtractActionTypes<typeof NoteActions>;
export const NoteActionTypes = ExtractActionTypes(NoteActions);
