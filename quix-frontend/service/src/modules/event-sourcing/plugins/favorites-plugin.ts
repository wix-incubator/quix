import {Injectable} from '@nestjs/common';
import {InjectEntityManager} from '@nestjs/typeorm';
import {EntityType} from '../../../common/entity-type.enum';
import {DbFavorites} from '../../../entities';
import {
  NotebookActions,
  NotebookActionTypes,
} from '@wix/quix-shared/entities/notebook';
import {EntityManager} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {IAction} from '../infrastructure/types';

@Injectable()
export class FavoritesPlugin implements EventBusPlugin {
  name = 'favorites';

  constructor(@InjectEntityManager() private em: EntityManager) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = [NotebookActionTypes.toggleIsLiked];

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      (action: IAction<NotebookActions>) => {
        switch (action.type) {
          case NotebookActionTypes.toggleIsLiked:
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<NotebookActions>) =>
        this.em.transaction(async transactionManager => {
          await this.projectFavorites(action, transactionManager);
        }),
    );
  };

  private async projectFavorites(
    action: IAction<NotebookActions>,
    tm: EntityManager,
  ) {
    switch (action.type) {
      case NotebookActionTypes.toggleIsLiked: {
        const favorite = {
          entityId: action.id,
          entityType: EntityType.Notebook,
          owner: (action as any).user,
        };

        if (action.isLiked) {
          return tm.save(Object.assign(new DbFavorites(), favorite));
        } else {
          return tm.delete(DbFavorites, favorite);
        }
      }
      default:
    }
  }
}
