import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../../config/config.module';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  FileTreeRepository,
  NoteRepository,
  DbFavorites,
} from 'entities';
import {QuixEventBus} from './quix-event-bus';
import {DbActionStore} from './infrastructure/action-store';
import {DbAction} from './infrastructure/action-store/entities/db-action.entity';
import {NotePlugin} from './plugins/note-plugin';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';
import {PassportModule} from '@nestjs/passport';

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
    ]),
    ConfigModule,
    PassportModule,
  ],
  controllers: [],
  providers: [
    QuixEventBus,
    DbActionStore,
    NotePlugin,
    NotebookPlugin,
    FileTreePlugin,
  ],
  exports: [QuixEventBus, DbActionStore],
})
export class EventSourcingModule {}
