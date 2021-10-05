import {Injectable} from '@nestjs/common';
import {InjectEntityManager, InjectRepository} from '@nestjs/typeorm';

import {
  DeletedNotebookActions,
  FileActions,
  FileType,
  IDeletedNotebook,
  NoteActions,
  NotebookActions,
  TrashBinActions,
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
import {EntityManager, Repository} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';

@Injectable()
export class TrashBinPlugin implements EventBusPlugin {
  name = 'trashBin';

  constructor(
    @InjectEntityManager() private em: EntityManager,
    @InjectRepository(DbFolder)
    private folderRepo: Repository<DbFolder>,
    @InjectRepository(FileTreeRepository)
    private fileTreeNodeRepo: FileTreeRepository,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = [
      TrashBinActionTypes.moveNotebookToTrashBin,
      TrashBinActionTypes.restoreDeletedNotebook,
      TrashBinActionTypes.permanentlyDeleteNotebook,
    ];

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.REACTION,
      async (action: IAction<TrashBinActionTypes>) => {
        switch (action.type) {
          case TrashBinActionTypes.moveNotebookToTrashBin: {
            return this.addNotebookReActions(action);
          }
          case TrashBinActionTypes.moveFolderToTrashBin: {
            return this.addFolderReActions(action);
          }
          case TrashBinActionTypes.restoreDeletedNotebook: {
            return this.restoreNotebookReActions(action);
          }
          case TrashBinActionTypes.permanentlyDeleteNotebook: {
            return this.permanentlyDeleteReActions(action);
          }
        }
      },
    );
  };

  private async restoreNotebookReActions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    const deletedNotebook = await this.em.findOneOrFail(
      DbDeletedNotebook,
      action.id,
    );

    const notebook = convertDbNotebook({
      ...deletedNotebook,
    });

    return [
      {
        ...NotebookActions.createNotebook(notebook.id, notebook),
        user: action.user,
      },
      {
        ...DeletedNotebookActions.deleteDeletedNotebook(notebook.id),
        user: action.user,
      },
    ];
  }

  private async addNotebookReActions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    const notebook = await this.em.findOneOrFail(DbNotebook, action.id);
    const deletedNotebook = {
      ...convertDbNotebook(notebook),
      dateDeleted: Date.now(),
    } as IDeletedNotebook;

    return [
      {
        ...DeletedNotebookActions.createDeletedNotebook(
          action.id,
          deletedNotebook,
        ),
        user: action.user,
      },
      {
        ...NotebookActions.deleteNotebook(action.id),
        user: action.user,
      },
    ];
  }

  async addFolderReActions(
    action: IAction<TrashBinActionTypes, string>,
  ): Promise<any> {
    const node = await this.fileTreeNodeRepo.findOneOrFail({id: action.id});
    const children = await this.fileTreeNodeRepo.getDeepChildren(node, this.em);
    const notebooks = children.find(c => c.type === FileType.notebook);

    let result: any[] = [];
    if (notebooks && Array.isArray(notebooks))
      result = notebooks.map(c => ({
        ...TrashBinActions.moveNotebookToTrashBin(c.id),
        user: action.user,
      }));

    const folders = children.find(c => c.type === FileType.folder);
    if (folders && Array.isArray(folders)) {
      result.concat(
        folders.map(f => ({
          ...FileActions.deleteFile(f.id),
          user: action.user,
        })),
      );
    }

    return [
      ...result,
      {
        ...FileActions.deleteFile(action.id),
        user: action.user,
      },
    ];
  }

  private async permanentlyDeleteReActions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    let result: any[] = [
      {
        ...DeletedNotebookActions.deleteDeletedNotebook(action.id),
        user: action.user,
      },
      {
        ...NotebookActions.toggleIsLiked(action.id, false),
        user: action.user,
      },
    ];

    const notes = await this.em.find(DbNote, {notebookId: action.id});

    result = [
      ...result,
      ...notes.map(n => ({...NoteActions.deleteNote(n.id), user: action.user})),
    ];

    return result;
  }
}
