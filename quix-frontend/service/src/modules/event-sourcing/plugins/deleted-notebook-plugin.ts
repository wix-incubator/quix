import {Injectable} from '@nestjs/common';
import {InjectEntityManager} from '@nestjs/typeorm';
import {DbDeletedNotebook} from '../../../entities';
import {
  convertDbDeletedNotebook,
  covertDeletedNotebookToDb,
} from '../../../entities/deleted-notebook/dbdeleted-notebook.entity';
import {
  DeletedNotebookActions,
  DeletedNotebookActionTypes,
  deletedNotebookReducer,
} from '@wix/quix-shared';
import {EntityManager} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';
import {assertOwner} from './utils';

@Injectable()
export class DeletedNotebookPlugin implements EventBusPlugin {
  name = 'deletedNotebook';

  constructor(@InjectEntityManager() private em: EntityManager) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = [
      DeletedNotebookActionTypes.createDeletedNotebook,
      DeletedNotebookActionTypes.deleteDeletedNotebook,
    ];

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: IAction<DeletedNotebookActions>) => {
        switch (action.type) {
          case DeletedNotebookActionTypes.deleteDeletedNotebook: {
            const deletedNotebook = await this.em.findOneOrFail(
              DbDeletedNotebook,
              {where: {id: action.id}},
            );
            assertOwner(deletedNotebook, action);
            break;
          }
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<DeletedNotebookActions>) =>
        this.em.transaction(async transactionManager => {
          await this.projectDeletedNotebook(action, transactionManager);
        }),
    );
  };

  private async projectDeletedNotebook(
    action: IAction<DeletedNotebookActions>,
    entityManager: EntityManager,
  ) {
    const dbModel =
      action.type === DeletedNotebookActionTypes.createDeletedNotebook
        ? undefined
        : await entityManager.findOne(DbDeletedNotebook, {where: {id: action.id}});
    const model = dbModel ? convertDbDeletedNotebook(dbModel) : undefined;

    const newModel = deletedNotebookReducer(model, action);
    if (newModel && model !== newModel) {
      return entityManager.save(covertDeletedNotebookToDb(newModel), {
        reload: false,
      });
    } else if (
      action.type === DeletedNotebookActionTypes.deleteDeletedNotebook
    ) {
      await entityManager.delete(DbDeletedNotebook, {id: action.id});
    }
  }
}
