import {DynamicModule, Module} from '@nestjs/common';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DbUser} from '../../entities';
import {EventSourcingModule} from '../../modules/event-sourcing/event-sourcing.module';
import {AuthController} from './auth.controller';
import {
  CustomLoginService,
  FakeLoginService,
  GoogleLoginService,
  LoginService,
} from './login.service';
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
  providers: [UsersService],
  exports: [UsersService],
})
export class AuthModule {
  static create(): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: LoginService,
          inject: [AuthOptions, JwtService],
          useFactory: (authOptions: AuthOptions, jwtService: JwtService) => {
            switch (authOptions.type) {
              case AuthTypes.CUSTOM:
                return new CustomLoginService(authOptions);
              case AuthTypes.GOOGLE:
                return new GoogleLoginService(authOptions, jwtService);
              case AuthTypes.FAKE:
                return new FakeLoginService(authOptions);
            }
          },
        },
      ],
      exports: [LoginService],
    };
  }
}
