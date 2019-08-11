import {Injectable} from '@nestjs/common';
import {InjectEntityManager} from '@nestjs/typeorm';
import {DbFavorites, DbFileTreeNode, DbNotebook} from 'entities';
import {FileTreeRepository} from 'entities/filenode/filenode.repository';
import {
  convertDbNotebook,
  covertNotebookToDb,
} from 'entities/notebook/dbnotebook.entity';
import {last} from 'lodash';
import {FileType} from 'shared/entities/file';
import {
  NotebookActions,
  NotebookActionTypes,
  notebookReducer,
} from 'shared/entities/notebook';
import {EntityManager} from 'typeorm';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {IAction} from '../infrastructure/types';
import {QuixHookNames} from '../types';
import {assertOwner} from './utils';

@Injectable()
export class NotebookPlugin implements EventBusPlugin {
  name = 'notebook';

  constructor(@InjectEntityManager() private em: EntityManager) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = [
      NotebookActionTypes.createNotebook,
      NotebookActionTypes.deleteNotebook,
      NotebookActionTypes.updateName,
    ];

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: IAction<NotebookActions>) => {
        switch (action.type) {
          case NotebookActionTypes.updateName:
          case NotebookActionTypes.deleteNotebook: {
            const notebook = await this.em.findOneOrFail(DbNotebook, action.id);
            assertOwner(notebook, action);
            break;
          }
          case NotebookActionTypes.createNotebook:
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<NotebookActions>) =>
        this.em.transaction(async transactionManager => {
          await this.projectNotebook(action, transactionManager);
          await this.projectFileTree(action, transactionManager);
          await this.projectFavorites(action, transactionManager);
        }),
    );
  };

  private async projectNotebook(
    action: IAction<NotebookActions>,
    tm: EntityManager,
  ) {
    const dbModel =
      action.type === NotebookActionTypes.createNotebook
        ? undefined
        : await tm.findOne(DbNotebook, action.id);

    const model = dbModel ? convertDbNotebook(dbModel) : undefined;

    const newModel = notebookReducer(model, action);

    if (newModel && model !== newModel) {
      return tm.save(covertNotebookToDb(newModel));
    } else if (action.type === NotebookActionTypes.deleteNotebook) {
      await tm.delete(DbNotebook, {id: action.id});
    }
  }

  private async projectFileTree(
    action: IAction<NotebookActions>,
    tm: EntityManager,
  ) {
    switch (action.type) {
      case NotebookActionTypes.createNotebook: {
        const {notebook} = action;
        const parent = last(notebook.path);
        const node = new DbFileTreeNode();

        node.id = notebook.id;
        node.notebookId = notebook.id;
        node.owner = action.user;
        node.type = FileType.notebook;
        node.parent = parent ? new DbFileTreeNode(parent.id) : undefined;

        return tm.getCustomRepository(FileTreeRepository).save(node);
      }
    }
  }

  private async projectFavorites(
    action: IAction<NotebookActions>,
    tm: EntityManager,
  ) {
    switch (action.type) {
      case NotebookActionTypes.deleteNotebook: {
        return tm.delete(DbFavorites, {
          entityId: action.id,
        });
      }
      default:
    }
  }
}
