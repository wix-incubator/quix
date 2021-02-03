import {
  IFilePathItem,
  FileActions,
  FileType,
} from '@wix/quix-shared/entities/file';
import * as uuid from 'uuid';
import {
  INote,
  createNote,
  NoteActions,
  createNotebook,
  NotebookActions,
  INotebook,
  createEmptyIUser,
} from '@wix/quix-shared';

class BaseMockDataBuilder<S extends string | never> {
  constructor(protected defaultUser: S) {}

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
        owner: user || '',
        ownerDetails: createEmptyIUser(user),
        dateCreated: 0,
        dateUpdated: 0,
      }),
      user,
    };
    return [id, action] as const;
  }
}
export class E2EMockDataBuilder extends BaseMockDataBuilder<never> {
  constructor() {
    super(undefined as never);
  }
}

export class MockDataBuilder extends BaseMockDataBuilder<string> {
  constructor(defaultUser: string) {
    super(defaultUser);
  }
}
