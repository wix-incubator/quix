import {IFilePathItem, FileActions, FileType} from 'shared/entities/file';
import * as uuid from 'uuid';
import {
  INote,
  createNote,
  NoteActions,
  createNotebook,
  NotebookActions,
  INotebook,
} from 'shared';

export class MockDataBuilder {
  constructor(private defaultUser?: string) {}

  createNotebook = createNotebook.bind(this);

  createNotebookAction(
    path: Partial<IFilePathItem>[] = [],
    user = this.defaultUser,
  ) {
    const id = uuid.v4();
    const action = {
      ...NotebookActions.createNotebook(
        id,
        createNotebook(path as IFilePathItem[], {id}),
      ),
      user,
    };
    return [id, action] as const;
  }

  createNoteAction(
    notebookId: string,
    note: Partial<INote> = {},
    user = this.defaultUser,
  ) {
    note.id = note.id || uuid.v4();
    const action = {
      ...NoteActions.addNote(note.id, createNote(notebookId, note)),
      user,
    };
    return action;
  }

  createFolderAction(
    name: string,
    path: {id: string}[],
    user = this.defaultUser,
  ) {
    const id = uuid.v4();
    const action = {
      ...FileActions.createFile(id, {
        id,
        type: FileType.folder,
        name,
        path: path as IFilePathItem[],
        isLiked: false,
        owner: '',
        dateCreated: 0,
        dateUpdated: 0,
      }),
      user,
    };
    return [id, action] as const;
  }
}
