import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from '../../entities';
import {ConfigModule} from '../../config/config.module';
import {SearchService} from './search';
@Module({
  imports: [
    TypeOrmModule.forFeature([DbFileTreeNode, DbFolder, DbNote, DbNotebook]),
  ],
  providers: [SearchService],
  controllers: [],
  exports: [SearchService],
})
export class SearchModule {}
