import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
  NoteRepository,
  DbFavorites,
  DbUser,
} from '../../entities';
import {QuixEventBus} from './quix-event-bus';
import {DbActionStore} from './infrastructure/action-store';
import {DbAction} from './infrastructure/action-store/entities/db-action.entity';
import {NotePlugin} from './plugins/note-plugin';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';
import {FavoritesPlugin} from './plugins/favorites-plugin';
import {UserPlugin} from './plugins/user-plugin';
import {NotebookRepository} from '../../entities/notebook/notebook.repository';
import {EventsService} from './events.service';
import {EventsPlugin} from './plugins/events-plugin';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DbFileTreeNode,
      DbFolder,
      DbNote,
      DbNotebook,
      DbAction,
      FileTreeRepository,
      NoteRepository,
      DbFavorites,
      NotebookRepository,
      DbUser,
    ]),
  ],
  controllers: [],
  providers: [
    QuixEventBus,
    DbActionStore,
    NotePlugin,
    NotebookPlugin,
    FileTreePlugin,
    FavoritesPlugin,
    UserPlugin,
    EventsPlugin,
    EventsService,
  ],
  exports: [QuixEventBus, DbActionStore, EventsService],
})
export class EventSourcingModule {}
