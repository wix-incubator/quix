import {Module, Provider, DynamicModule} from '@nestjs/common';
import {ConfigModule} from 'config/config.module';
import {
  AuthService,
  GoogleAuthService,
  OpenidAuthService,
  FakeAuthService,
} from './auth.service';
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from 'config';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from './jwt-strategy';
import {MockStrategy} from './mock-strategy';
import {AuthController} from './auth.controller';
import {getEnv} from 'config/env/env';
import {UsersService} from './users.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbUser} from 'entities';
import {EventSourcingModule} from 'modules/event-sourcing/event-sourcing.module';

const googleAuthServiceProvider = {
  provide: AuthService,
  useClass: GoogleAuthService,
};

const openidAuthServiceProvider = {
  provide: AuthService,
  useClass: OpenidAuthService,
};

const fakeAuthServiceProvider = {
  provide: AuthService,
  useClass: FakeAuthService,
};

// TODO: Try to build the dynamic module using configService instead of env.
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([DbUser]),
    EventSourcingModule,
  ],
  controllers: [AuthController],
  providers: [UsersService],
  exports: [PassportModule, UsersService],
})
export class AuthModule {
  static create(): DynamicModule {
    const env = getEnv();

    switch (env.AuthType) {
      case 'google':
      case 'openid':
        const authServiceProvider =
          env.AuthType === 'google'
            ? googleAuthServiceProvider
            : openidAuthServiceProvider;

        return {
          module: AuthModule,
          imports: [
            JwtModule.registerAsync({
              imports: [ConfigModule],
              useFactory: (configService: ConfigService) => ({
                secretOrPrivateKey: configService.getEnvSettings().AuthEncKey,
                signOptions: {algorithm: 'HS256', expiresIn: '30d'},
              }),

              inject: [ConfigService],
            }),
            PassportModule.registerAsync({
              useFactory: () => ({
                defaultStrategy: 'jwt',
              }),
            }),
          ],
          providers: [authServiceProvider, JwtStrategy],
        };

      case 'fake':
        return {
          module: AuthModule,
          imports: [
            PassportModule.registerAsync({
              useFactory: () => ({
                defaultStrategy: 'fake',
              }),
            }),
          ],
          providers: [fakeAuthServiceProvider, MockStrategy],
        };
    }
    throw new Error('AuthModule:: Unknown auth type');
  }
}
