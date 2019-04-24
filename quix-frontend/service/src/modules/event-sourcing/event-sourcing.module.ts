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
} from 'entities';
import {QuixEventBus} from './quix-event-bus';
import {DbActionStore} from './infrastructure/action-store';
import {DbAction} from './infrastructure/action-store/entities/db-action';
import {NotePlugin} from './plugins/note-plugin';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';
import {AuthModule} from '../auth/auth.module';
import {EventsController} from './events.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      DbFileTreeNode,
      DbFolder,
      DbNote,
      DbNotebook,
      DbAction,
      FileTreeRepository,
      NoteRepository,
    ]),
    ConfigModule,
  ],
  controllers: [EventsController],
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
