import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../../config/config.module';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {QuixEventBus} from './quix-event-bus';
import {DbActionStore} from './infrastructure/action-store';
import {MySqlAction} from './infrastructure/action-store/entities/mysql-action';
import {NotePlugin} from './plugins/note-plugin';
import {NotebookPlugin} from './plugins/notebook-plugin';
import {FileTreePlugin} from './plugins/file-tree-plugin';
import {AuthModule} from '../auth/auth.module';
import {FileTreeRepository} from '../../entities/filenode.repository';
import {EventsController} from './events.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      DbFileTreeNode,
      DbFolder,
      DbNote,
      DbNotebook,
      MySqlAction,
      FileTreeRepository,
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
