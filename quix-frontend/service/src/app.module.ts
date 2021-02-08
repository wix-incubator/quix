import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SearchModule} from './modules/search/search.module';
import {EventSourcingModule} from './modules/event-sourcing/event-sourcing.module';
import {WebApiModule} from './modules/web-api/web-api.module';
import {ConfigService, ConfigModule} from './config';
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
import {AuthModuleConfiguration} from './modules/auth/auth.module';
import {AuthTypes} from './modules/auth/types';

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
    ConfigModule.create(),
    EventSourcingModule,
    WebApiModule,
    ProxyDbApiBackend,
    SearchModule,
    AuthModuleConfiguration.createAsync({
      injects: [ConfigService],
      imports: [],
      useFactory: (configService: ConfigService) => {
        const env = configService.getEnvSettings();
        if (env.AuthType === 'fake') {
          return {
            type: AuthTypes.FAKE,
            cookieName: env.AuthCookieName,
          };
        } else if (env.AuthType === 'google') {
          return {
            type: AuthTypes.GOOGLE,
            cookieEncKey: env.AuthEncKey,
            cookieName: env.AuthCookieName,
            cookieTTL: env.CookieAge,
            googleAuthSecret: env.GoogleAuthSecret,
            googleClientId: env.GoogleClientId,
          };
        }
        throw new Error('unknown auth type');
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
