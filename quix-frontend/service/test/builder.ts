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
  DeletedNotebookActions,
  createDeletedNotebook,
  INotebook,
  createEmptyIUser,
  IDeletedNotebook,
  TrashBinActionTypes,
  TrashBinActions,
} from '@wix/quix-shared';
import {string} from 'fp-ts';

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

  createDeletedNotebookAction(
    path: Partial<IFilePathItem>[] = [],
    user = this.defaultUser,
  ) {
    const id = uuid.v4();
    const action = {
      ...DeletedNotebookActions.createDeletedNotebook(
        id,
        createDeletedNotebook(path as IFilePathItem[], {id}),
      ),
      user,
    };
    return [id, action] as const;
  }

  permanentlyDeleteDeletedNotebookAction(
    user = this.defaultUser,
    notebookId?: string,
  ) {
    notebookId = notebookId || uuid.v4();
    const action = {
      ...TrashBinActions.permanentlyDeleteNotebook(notebookId),
      user,
    };
    return [notebookId, action] as const;
  }

  moveNotebookToTrashBinAction(user = this.defaultUser, notebookId?: string) {
    const id = notebookId || uuid.v4();
    const action = {
      ...TrashBinActions.moveNotebookToTrashBin(id),
      user,
      ethereal: true,
    };
    return [id, action] as const;
  }

  restoreNotebookFromTrashBinAction(
    user = this.defaultUser,
    restoreFolderId: string,
    notebookId?: string,
  ) {
    const id = notebookId || uuid.v4();
    const action = {
      ...TrashBinActions.restoreDeletedNotebook(id, restoreFolderId),
      user,
      ethereal: true,
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
