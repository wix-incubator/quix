import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
  NoteRepository,
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
import {EventsGateway} from './events.gateway';
import { AutocompleteService } from './autocomplete/autocomplete.service';
import { AutocompleteController } from './autocomplete/autocomplete.controller';

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
    AutocompleteController,
  ],
  providers: [NotebookService, FoldersService, FavoritesService, EventsGateway, AutocompleteService],
  exports: [],
})
export class WebApiModule {}
