import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SearchController} from './search.controller';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {ConfigModule} from '../../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DbFileTreeNode, DbFolder, DbNote, DbNotebook]),
    ConfigModule,
  ],
  providers: [],
  controllers: [SearchController],
})
export class SearchModule {}
