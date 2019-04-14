import {
  EventBus,
  EventBusBuilder,
  EventBusPlugin,
} from './infrastructure/event-bus';

import {Injectable, Inject} from '@nestjs/common';
import {QuixHookNames} from './types';
import {IActionStore, DbActionStore} from './infrastructure/action-store';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {
  DefaultAction,
  BaseAction,
} from '../../../../shared/entities/common/common-types';
import {NotePlugin} from './plugins/note-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';

@Injectable()
export class QuixEventBus<A extends BaseAction = DefaultAction> {
  private bus: EventBus;

  constructor(
    @Inject(DbActionStore) private actionStore: IActionStore,
    @Inject(NotebookPlugin) private notebookPlugin: EventBusPlugin,
    @Inject(NotePlugin) private notePlugin: EventBusPlugin,
    @Inject(FileTreePlugin) private fileTreePlugin: EventBusPlugin,
  ) {
    this.bus = EventBusBuilder()
      .addPlugin(this.notebookPlugin)
      .addPlugin(this.notePlugin)
      .addPlugin(this.fileTreePlugin)
      .addMiddleware(async (action, api, next) => {
        api.hooks
          .call(QuixHookNames.VALIDATION, action)
          .then(() => next())
          .catch(e => next(e));
      })
      .addMiddleware(async (action, api, next) => {
        this.actionStore
          .pushAction(action)
          .then(() => next())
          .catch(e => next(e));
      })
      .addMiddleware(async (action, api, next) => {
        api.hooks
          .call(QuixHookNames.PROJECTION, action)
          .then(() => next())
          .catch(e => next(e));
      })
      .build();
  }

  async emit(action: A | A[]): Promise<void> {
    if (Array.isArray(action)) {
      for (const a of action) {
        await this.bus.emit(a);
      }
      return;
    }
    return this.bus.emit(action);
  }

  on<T extends string>(type: T, handler: (action: A & {type: T}) => any) {
    this.bus.on(type, handler);
    return this;
  }
}
