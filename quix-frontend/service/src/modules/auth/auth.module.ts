import {DynamicModule, Global, Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '../../config/config.module';
import {DbUser} from '../../entities';
import {EventSourcingModule} from '../../modules/event-sourcing/event-sourcing.module';
import {AuthController} from './auth.controller';
import {LoginService} from './login.service';
import {JwtStrategy, MockStrategy} from './passport-strategies';
import {AuthAsyncOptions, AuthOptions, AuthTypes} from './types';
import {UsersService} from './users.service';

/** read about nest.js dynamic modules to understand this */

@Module({})
export class AuthModuleConfiguration {
  static createAsync(authAsyncOptions: AuthAsyncOptions): DynamicModule {
    return {
      global: true, // feels like workaround, couldn't get injection to work otherwise
      module: AuthModuleConfiguration,
      imports: authAsyncOptions.imports,
      providers: [
        {
          provide: AuthOptions,
          inject: authAsyncOptions.injects,
          useFactory: authAsyncOptions.useFactory,
        },
      ],
      exports: [AuthOptions],
    };
  }
  static create(authOption: AuthOptions): DynamicModule {
    return {
      global: true,
      module: AuthModuleConfiguration,
      providers: [
        {
          provide: AuthOptions,
          useValue: authOption,
        },
      ],
      exports: [AuthOptions],
    };
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([DbUser]),
    EventSourcingModule,
    AuthModuleConfiguration,

    PassportModule.registerAsync({
      inject: [AuthOptions],
      imports: [AuthModuleConfiguration],
      useFactory: (authOptions: AuthOptions) => {
        switch (authOptions.type) {
          case AuthTypes.GOOGLE:
            return {defaultStrategy: 'jwt'};
          case AuthTypes.CUSTOM:
            return {defaultStrategy: 'custom'};
          case AuthTypes.FAKE:
          default:
            return {defaultStrategy: 'fake'};
        }
      },
    }),
    JwtModule.registerAsync({
      imports: [AuthModuleConfiguration],
      inject: [AuthOptions],
      useFactory: (authOptions: AuthOptions) => {
        switch (authOptions.type) {
          case AuthTypes.GOOGLE:
            return {
              secret: authOptions.cookieEncKey,
              signOptions: {
                algorithm: 'HS256',
                expiresIn: authOptions.cookieTTL,
              },
            };
          case AuthTypes.CUSTOM:
            return authOptions.jwtServiceOptions || {secret: '12345'};
          case AuthTypes.FAKE:
          default:
            return {secret: '12345'};
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginService, UsersService, MockStrategy, JwtStrategy],
  exports: [UsersService, PassportModule],
})
export class AuthModule {}
