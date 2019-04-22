import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../../config/config.module';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {FileTreeRepository} from '../../entities/filenode.repository';
import {DbAction} from '../event-sourcing/infrastructure/action-store/entities/db-action';
import {FoldersController} from './folders/folders.controller';
import {FoldersService} from './folders/folders.service';
import {NotebookController} from './notebooks/notebooks.controller';
import {NotebookService} from './notebooks/notebooks.service';
import {AuthModule} from '../auth/auth.module';
import {EventSourcingModule} from '../event-sourcing/event-sourcing.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      DbFileTreeNode,
      DbFolder,
      DbNote,
      DbNotebook,
      DbAction,
      FileTreeRepository,
    ]),
    ConfigModule,
    AuthModule,
    EventSourcingModule,
  ],
  controllers: [NotebookController, FoldersController],
  providers: [NotebookService, FoldersService],
  exports: [],
})
export class WebApiModule {}
