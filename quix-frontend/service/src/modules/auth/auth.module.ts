import {Module, Provider, DynamicModule} from '@nestjs/common';
import {ConfigModule} from 'config/config.module';
import {AuthService} from './auth.service';
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from 'config';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from './jwt-strategy';
import {MockStrategy} from './mock-strategy';
import {AuthController, FakeAuthController} from './auth.controller';
import {getEnv} from 'config/env';

// TODO: Try to build the dynamic module using configService instead of env.
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
  exports: [PassportModule],
})
export class AuthModule {
  static create(): DynamicModule {
    const env = getEnv();
    if (env.AuthType === 'google') {
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
        controllers: [AuthController],
        providers: [AuthService, JwtStrategy],
      };
    } else if (env.AuthType === 'fake') {
      return {
        module: AuthModule,
        imports: [
          PassportModule.registerAsync({
            useFactory: () => ({
              defaultStrategy: 'fake',
            }),
          }),
        ],
        controllers: [FakeAuthController],
        providers: [MockStrategy],
      };
    }
    throw new Error('AuthModule:: Unkown auth type');
  }
}
