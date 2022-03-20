import {
  EventBus,
  EventBusBuilder,
  EventBusPlugin,
} from './infrastructure/event-bus';

import {Injectable, Inject, ConsoleLogger} from '@nestjs/common';
import {QuixHookNames} from './types';
import {IActionStore, DbActionStore} from './infrastructure/action-store';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {NotePlugin} from './plugins/note-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';
import {FavoritesPlugin} from './plugins/favorites-plugin';
import {IAction, IEventData} from './infrastructure/types';
import {UserPlugin} from './plugins/user-plugin';
import {EventsPlugin} from './plugins/events-plugin';
import {DeletedNotebookPlugin} from './plugins/deleted-notebook-plugin';
import {TrashBinPlugin} from './plugins/trash-bin-plugin';
import {EventsService} from './events.service';

@Injectable()
export class QuixEventBus<A extends IAction = IAction> {
  private bus: EventBus;
  private logger = new ConsoleLogger(QuixEventBus.name);

  constructor(
    @Inject(DbActionStore) private actionStore: IActionStore,
    @Inject(NotebookPlugin) private notebookPlugin: EventBusPlugin,
    @Inject(NotePlugin) private notePlugin: EventBusPlugin,
    @Inject(FileTreePlugin) private fileTreePlugin: EventBusPlugin,
    @Inject(FavoritesPlugin) private favoritesPlugin: EventBusPlugin,
    @Inject(UserPlugin) private userPlugin: EventBusPlugin,
    @Inject(DeletedNotebookPlugin)
    private deletedNotebookPlugin: EventBusPlugin,
    @Inject(TrashBinPlugin) private trashBinPlugin: EventBusPlugin,
    @Inject(EventsPlugin) private eventsPlugin: EventBusPlugin,
    @Inject(EventsService) private eventsService: EventsService,
  ) {
    this.bus = EventBusBuilder()
      .addPlugin(this.notebookPlugin)
      .addPlugin(this.deletedNotebookPlugin)
      .addPlugin(this.trashBinPlugin)
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
      .addMiddleware(async (action, api, next) => {
        api.hooks
          .call(QuixHookNames.REACTION, action)
          .then(async props => {
            let [reactions] = props;

            if (reactions && Array.isArray(reactions) && reactions.length > 0) {
              reactions = reactions.map(r => ({...r, syncClients: false}));
              await this.emit(reactions);

              api.pushLoggedActions(reactions);
            }

            next();
          })
          .catch(e => next(e));
      })
      .build();
  }

  async emit(action: A | A[]) {
    this.logger.log(`got action ${JSON.stringify(action)}`);
    if (Array.isArray(action)) {
      const result = [];
      for (const a of action) {
        result.push(...(await this.bus.emit(a)));
      }
      this.logger.log(`got ReActions ${JSON.stringify(result)}`);
      return result;
    }
    return this.bus.emit(action);
  }

  on<T extends string>(type: T, handler: (action: A & {type: T}) => any) {
    this.bus.on(type, handler);
    return this;
  }
}
