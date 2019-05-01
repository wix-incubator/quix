import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from 'entities';
import {ConfigModule} from 'config/config.module';
import {AuthModule} from 'modules/auth/auth.module';
import {SearchController} from './search.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([DbFileTreeNode, DbFolder, DbNote, DbNotebook]),
    ConfigModule,
    AuthModule.create(),
  ],
  providers: [],
  controllers: [SearchController],
})
export class SearchModule {}
