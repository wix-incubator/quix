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
import {asUser} from './utils';

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
            return this.addNotebookReActions(action);
          case TrashBinActionTypes.moveFolderToTrashBin:
            return this.addFolderReActions(action);
          case TrashBinActionTypes.restoreDeletedNotebook:
            return this.restoreNotebookReActions(action);
          case TrashBinActionTypes.permanentlyDeleteNotebook:
            return this.permanentlyDeleteReActions(action);
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
      asUser(NotebookActions.createNotebook(notebook.id, notebook), action),
      asUser(DeletedNotebookActions.deleteDeletedNotebook(notebook.id), action),
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
      asUser(
        DeletedNotebookActions.createDeletedNotebook(
          action.id,
          deletedNotebook,
        ),
        action,
      ),
      asUser(NotebookActions.deleteNotebook(action.id), action),
    ];
  }

  async addFolderReActions(
    action: IAction<TrashBinActionTypes, string>,
  ): Promise<any> {
    const node = await this.fileTreeNodeRepo.findOneOrFail({id: action.id});
    const children = await this.fileTreeNodeRepo.getDeepChildren(node, this.em);
    const notebooks = children.filter(c => c.type === FileType.notebook);

    return [
      ...notebooks.map(c =>
        asUser(TrashBinActions.moveNotebookToTrashBin(c.id), action),
      ),
      asUser(FileActions.deleteFile(action.id), action),
    ];
  }

  private async permanentlyDeleteReActions(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    let result: any[] = [
      asUser(DeletedNotebookActions.deleteDeletedNotebook(action.id), action),
      asUser(NotebookActions.toggleIsLiked(action.id, false), action),
    ];

    const notes = await this.em.find(DbNote, {notebookId: action.id});

    result = [
      ...result,
      ...notes.map(n => asUser(NoteActions.deleteNote(n.id), action)),
    ];

    return result;
  }
}
