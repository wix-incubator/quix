import {Injectable} from '@nestjs/common';
import {InjectEntityManager, InjectRepository} from '@nestjs/typeorm';

import {
  DeletedNotebookActions,
  FileActions,
  FileType,
  IDeletedNotebook,
  NoteActions,
  NotebookActions,
  TrashBinActionTypes,
} from '@wix/quix-shared';
import {
  DbDeletedNotebook,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
} from '../../../entities';
import {convertDbNotebook} from '../../../entities/notebook/dbnotebook.entity';
import {EntityManager} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';
import {asUser} from './utils';

@Injectable()
export class TrashBinPlugin implements EventBusPlugin {
  name = 'trashBin';

  constructor(
    @InjectEntityManager() private em: EntityManager,
    @InjectRepository(FileTreeRepository)
    private fileTreeNodeRepo: FileTreeRepository,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = [
      TrashBinActionTypes.moveNotebookToTrashBin,
      TrashBinActionTypes.moveFolderToTrashBin,
      TrashBinActionTypes.restoreDeletedNotebook,
      TrashBinActionTypes.permanentlyDeleteNotebook,
    ];

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.REACTION,
      async (action: IAction<TrashBinActionTypes>) => {
        switch (action.type) {
          case TrashBinActionTypes.moveNotebookToTrashBin:
            return this.addNotebookReactions(action);
          case TrashBinActionTypes.moveFolderToTrashBin:
            return this.addFolderReactions(action);
          case TrashBinActionTypes.restoreDeletedNotebook:
            return this.restoreNotebookReactions(action);
          case TrashBinActionTypes.permanentlyDeleteNotebook:
            return this.permanentlyDeleteReactions(action);
        }
      },
    );
  };

  private async restoreNotebookReactions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    const deletedNotebook = await this.em.findOneOrFail(
      DbDeletedNotebook,
      action.id,
    );

    const folder = await this.em.findOneOrFail(DbFolder, {
      id: (action as any).folderId,
    });

    const notebook = convertDbNotebook(
      {
        ...deletedNotebook,
      },
      [{id: folder.id, name: folder.name}],
    );

    return [
      asUser(
        NotebookActions.createNotebook(notebook.id, notebook),
        action.user,
        action.userId,
      ),
      asUser(
        DeletedNotebookActions.deleteDeletedNotebook(notebook.id),
        action.user,
        action.userId,
      ),
    ];
  }

  private async addNotebookReactions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    return this.addNotebook(action.id, action.user, action.userId);
  }

  private async addNotebook(notebookId: string, user: string, userId?: string) {
    const notebook = await this.em.findOneOrFail(DbNotebook, notebookId);
    const deletedNotebook = {
      ...convertDbNotebook(notebook),
      dateDeleted: Date.now(),
    } as IDeletedNotebook;

    return [
      asUser(
        DeletedNotebookActions.createDeletedNotebook(
          notebookId,
          deletedNotebook,
        ),
        user,
        userId,
      ),
      asUser(NotebookActions.deleteNotebook(notebookId), user, userId),
    ];
  }

  async addFolderReactions(
    action: IAction<TrashBinActionTypes, string>,
  ): Promise<any> {
    const node = await this.fileTreeNodeRepo.findOneOrFail({id: action.id});
    const children = await this.fileTreeNodeRepo.getDeepChildren(node, this.em);
    const notebooks = children
      .filter(c => c.type === FileType.notebook)
      .map(async n => this.addNotebook(n.id, action.user, action.userId));

    const actions: any[] = [];

    for await (const a of notebooks) {
      actions.push(...a);
    }

    return [
      ...actions,
      asUser(FileActions.deleteFile(action.id), action.user, action.userId),
    ];
  }

  private async permanentlyDeleteReactions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    let result: any[] = [
      asUser(
        DeletedNotebookActions.deleteDeletedNotebook(action.id),
        action.user,
        action.userId,
      ),
      asUser(
        NotebookActions.toggleIsLiked(action.id, false),
        action.user,
        action.userId,
      ),
    ];

    const notes = await this.em.find(DbNote, {notebookId: action.id});

    result = [
      ...result,
      ...notes.map(n =>
        asUser(NoteActions.deleteNote(n.id), action.user, action.userId),
      ),
    ];

    return result;
  }
}
