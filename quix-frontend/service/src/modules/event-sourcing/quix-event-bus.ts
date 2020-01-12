import {
  EventBus,
  EventBusBuilder,
  EventBusPlugin,
} from './infrastructure/event-bus';

import {Injectable, Inject, Logger} from '@nestjs/common';
import {QuixHookNames} from './types';
import {IActionStore, DbActionStore} from './infrastructure/action-store';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {NotePlugin} from './plugins/note-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';
import {FavoritesPlugin} from './plugins/favorites-plugin';
import {IAction} from './infrastructure/types';
import {UserPlugin} from './plugins/user-plugin';
import {EventsPlugin} from './plugins/events-plugin';

@Injectable()
export class QuixEventBus<A extends IAction = IAction> {
  private bus: EventBus;
  private logger = new Logger(QuixEventBus.name);

  constructor(
    @Inject(DbActionStore) private actionStore: IActionStore,
    @Inject(NotebookPlugin) private notebookPlugin: EventBusPlugin,
    @Inject(NotePlugin) private notePlugin: EventBusPlugin,
    @Inject(FileTreePlugin) private fileTreePlugin: EventBusPlugin,
    @Inject(FavoritesPlugin) private favoritesPlugin: EventBusPlugin,
    @Inject(UserPlugin) private userPlugin: EventBusPlugin,
    @Inject(EventsPlugin) private eventsPlugin: EventBusPlugin,
  ) {
    this.bus = EventBusBuilder()
      .addPlugin(this.notebookPlugin)
      .addPlugin(this.notePlugin)
      .addPlugin(this.fileTreePlugin)
      .addPlugin(this.favoritesPlugin)
      .addPlugin(this.userPlugin)
      .addPlugin(this.eventsPlugin)
      .addMiddleware(async (action, api, next) => {
        api.hooks
          .call(QuixHookNames.VALIDATION, action)
          .then(() => next())
          .catch(e => next(e));
      })
      .addMiddleware(async (action, api, next) => {
        if (action.ethereal) {
          next();
        } else {
          this.actionStore
            .pushAction(action)
            .then(() => next())
            .catch(e => next(e));
        }
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
    // this.logger.log(`got action ${JSON.stringify(action)}`);
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
