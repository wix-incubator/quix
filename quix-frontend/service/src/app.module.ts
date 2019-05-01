import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SearchModule} from './modules/search/search.module';
import {AuthModule} from './modules/auth/auth.module';
import {EventSourcingModule} from './modules/event-sourcing/event-sourcing.module';
import {WebApiModule} from './modules/web-api/web-api.module';
import {ConfigService, ConfigModule} from './config';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from './entities';
import {DbAction} from './modules/event-sourcing/infrastructure/action-store/entities/db-action';
import {ProxyDbApiBackend} from './modules/proxy-backend/proxy-backend.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cs: ConfigService) =>
        cs.getDbConnection([
          DbFileTreeNode,
          DbFolder,
          DbNote,
          DbNotebook,
          DbAction,
        ]),
      inject: [ConfigService],
    }),
    AuthModule.create(),
    ConfigModule,
    EventSourcingModule,
    WebApiModule,
    ProxyDbApiBackend,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
