import {Injectable} from '@nestjs/common';
import {InjectRepository, InjectEntityManager} from '@nestjs/typeorm';
import {DbNotebook, DbFileTreeNode} from 'entities';
import {Repository, EntityManager} from 'typeorm';
import {
  notebookReducer,
  NotebookActionTypes,
  NotebookActions,
} from 'shared/entities/notebook';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {last} from 'lodash';
import {FileType} from 'shared/entities/file';
import {FileTreeRepository} from 'entities/filenode.repository';

@Injectable()
export class NotebookPlugin implements EventBusPlugin {
  name = 'notebook';

  constructor(
    @InjectRepository(DbNotebook)
    private notebookRepoistory: Repository<DbNotebook>,
    @InjectEntityManager() private em: EntityManager,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = [
      NotebookActionTypes.createNotebook,
      NotebookActionTypes.deleteNotebook,
      NotebookActionTypes.updateName,
    ];
    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(QuixHookNames.VALIDATION, (action: NotebookActions) => {
      switch (action.type) {
        case NotebookActionTypes.updateName:
        case NotebookActionTypes.deleteNotebook:
        case NotebookActionTypes.createNotebook:
      }
    });

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: NotebookActions) =>
        this.em.transaction('SERIALIZABLE', async transactionManager => {
          await this.projectionHandleNotebookDb(action, transactionManager);
          await this.projectionHandleFileTreeDb(action, transactionManager);
        }),
    );
  };

  async projectionHandleNotebookDb(action: NotebookActions, tm: EntityManager) {
    const model =
      action.type === NotebookActionTypes.createNotebook
        ? undefined
        : await tm.findOne(DbNotebook, action.id);

    const newModel = notebookReducer(model, action);

    if (newModel && model !== newModel) {
      return tm.save(new DbNotebook(newModel));
    } else if (action.type === NotebookActionTypes.deleteNotebook) {
      return tm.delete(DbNotebook, {id: action.id});
    }
  }

  async projectionHandleFileTreeDb(action: NotebookActions, tm: EntityManager) {
    switch (action.type) {
      case NotebookActionTypes.createNotebook: {
        const {notebook} = action;
        const parent = last(notebook.path);
        const node = new DbFileTreeNode();
        node.id = notebook.id;
        node.notebookId = notebook.id;
        node.owner = (action as any).user;
        node.type = FileType.notebook;
        node.parent = parent ? new DbFileTreeNode(parent.id) : undefined;
        return tm.getCustomRepository(FileTreeRepository).save(node);
      }
    }
  }
}
