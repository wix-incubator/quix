import {Injectable} from '@nestjs/common';
import {InjectEntityManager} from '@nestjs/typeorm';

import {
  DeletedNotebookActions,
  IDeletedNotebook,
  NotebookActions,
  TrashBinActionTypes,
} from '@wix/quix-shared';
import {DbDeletedNotebook, DbNotebook} from '../../../entities';
import {convertDbNotebook} from '../../../entities/notebook/dbnotebook.entity';
import {EntityManager} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';

@Injectable()
export class TrashBinPlugin implements EventBusPlugin {
  name = 'trashBin';

  constructor(@InjectEntityManager() private em: EntityManager) {}

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
            return this.getActionsForAddingToTrashBin(action);
          }
          case TrashBinActionTypes.restoreDeletedNotebook: {
            return this.getActionsForRestoreFromTrashBin(action);
          }
          case TrashBinActionTypes.permanentlyDeleteNotebook: {
            return this.getActionsForPermanentlyDeleteFromTrashBin(action);
          }
        }
      },
    );
  };

  private async getActionsForRestoreFromTrashBin(
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

  private async getActionsForAddingToTrashBin(
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

  private async getActionsForPermanentlyDeleteFromTrashBin(
    action: IAction<TrashBinActionTypes, string>,
  ) {
    return [
      {
        ...DeletedNotebookActions.deleteDeletedNotebook(action.id),
        user: action.user,
      },
      {
        ...NotebookActions.toggleIsLiked(action.id, false),
        user: action.user,
      },
    ];
  }
}
