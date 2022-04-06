import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
  NoteRepository,
  DbDeletedNotebook,
  DbUser,
  DbFavorites,
} from '../../entities';
import {DbAction} from '../event-sourcing/infrastructure/action-store/entities/db-action.entity';
import {FoldersController} from './folders/folders.controller';
import {FoldersService} from './folders/folders.service';
import {NotebookController} from './notebooks/notebooks.controller';
import {NotebookService} from './notebooks/notebooks.service';
import {AuthModule} from '../auth/auth.module';
import {EventSourcingModule} from '../event-sourcing/event-sourcing.module';
import {EventsController} from './events.controller';
import {SearchController} from './search.controller';
import {SearchModule} from '../../modules/search/search.module';
import {UserListController} from './user-list.controller';
import {FavoritesService} from './favorites/favorites.service';
import {FavoritesController} from './favorites/favorites.controller';
import {DeletedNotebooksController} from './deleted-notebooks/deleted-notebook.controller';
import {EventsGateway} from './events.gateway';
import {AutocompleteService} from './autocomplete/autocomplete.service';
import {AutocompleteController} from './autocomplete/autocomplete.controller';
import {DeletedNotebooksService} from './deleted-notebooks/deleted-notebook.service';
import {QuixEventBus} from '../event-sourcing/quix-event-bus';

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
      DbDeletedNotebook,
      DbUser,
      DbFavorites,
    ]),
    AuthModule.create(),
    EventSourcingModule,
    SearchModule,
  ],
  controllers: [
    NotebookController,
    FoldersController,
    EventsController,
    SearchController,
    UserListController,
    FavoritesController,
    DeletedNotebooksController,
    AutocompleteController,
  ],
  providers: [
    NotebookService,
    FoldersService,
    FavoritesService,
    EventsGateway,
    AutocompleteService,
    DeletedNotebooksService,
  ],
  exports: [],
})
export class WebApiModule {}
