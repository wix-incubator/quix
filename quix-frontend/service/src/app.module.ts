import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {BaseModule} from './base.module';
import {ConfigModule, ConfigService} from './config';
import {AuthModuleConfiguration} from './modules/auth/auth.module';
import {AuthTypes} from './modules/auth/types';
@Module({
  imports: [
    BaseModule,
    ConfigModule.create(),
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
