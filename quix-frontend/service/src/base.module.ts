import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SearchModule} from './modules/search/search.module';
import {EventSourcingModule} from './modules/event-sourcing/event-sourcing.module';
import {WebApiModule} from './modules/web-api/web-api.module';
import {ConfigService} from './config';
import {
  DbFileTreeNode,
  DbFolder,
  DbNote,
  DbNotebook,
  DbUser,
  DbFavorites,
  DbMetadata,
} from './entities';
import {DbAction} from './modules/event-sourcing/infrastructure/action-store/entities/db-action.entity';
import {ProxyDbApiBackend} from './modules/proxy-backend/proxy-backend.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: async (cs: ConfigService) =>
        cs.getDbConnection([
          DbFileTreeNode,
          DbFolder,
          DbNote,
          DbNotebook,
          DbAction,
          DbUser,
          DbFavorites,
          DbMetadata,
        ]),
      inject: [ConfigService],
    }),
    EventSourcingModule,
    WebApiModule,
    ProxyDbApiBackend,
    SearchModule,
  ],
  controllers: [AppController],
})
export class BaseModule { }
