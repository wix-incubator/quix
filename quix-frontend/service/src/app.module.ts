import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SearchModule} from './modules/search/search.module';
import {AuthModule} from './modules/auth/auth.module';
import {ConfigModule} from './config/config.module';
import {EventSourcingModule} from './modules/event-sourcing/event-sourcing.module';
import {WebApiModule} from './modules/web-api/web-api.module';
import {ConfigService} from './config/config.service';
import {DbFileTreeNode, DbFolder, DbNote, DbNotebook} from './entities';
import {MySqlAction} from './modules/event-sourcing/infrastructure/action-store/entities/mysql-action';

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
          MySqlAction,
        ]),
      inject: [ConfigService],
    }),
    AuthModule,
    ConfigModule,
    EventSourcingModule,
    WebApiModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
