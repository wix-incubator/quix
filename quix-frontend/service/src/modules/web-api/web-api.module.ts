import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../../config/config.module';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {FileTreeRepository} from '../../entities/filenode.repository';
import {MySqlAction} from '../event-sourcing/infrastructure/action-store/entities/mysql-action';
import {FoldersController} from './folders/folders.controller';
import {FoldersService} from './folders/folders.service';
import {NotebookController} from './notebooks/notebooks.controller';
import {NotebookService} from './notebooks/notebooks.service';
import {AuthModule} from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      DbFileTreeNode,
      DbFolder,
      DbNote,
      DbNotebook,
      MySqlAction,
      FileTreeRepository,
    ]),
    ConfigModule,
    AuthModule,
  ],
  controllers: [NotebookController, FoldersController],
  providers: [NotebookService, FoldersService],
  exports: [],
})
export class WebApiModule {}
