import {ExtractActionTypes, ExtractActions} from '../common/actions';
import {createNote} from './note';

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
  
  addNote: (notebookId: string) => {
    const note = createNote(notebookId);

    return {
      type: 'note.create' as const,
      note,
      id: note.id
    };
  },

  deleteNote: (id: string) => ({
    type: 'note.delete' as const,
    id
  }),
}

export type NoteActions = ExtractActions<typeof NoteActions>;
export type NoteActionT<T extends NoteActionTypes> = NoteActions & {type: T};
export type NoteActionTypes = ExtractActionTypes<typeof NoteActions>;
export const NoteActionTypes = ExtractActionTypes(NoteActions);
