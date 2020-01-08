import {ExtractJwt, Strategy as JwtStrategyBase} from 'passport-jwt';
import {AuthService} from './auth.service';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {IGoogleUser} from './types';
import {ConfigService} from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        req => req.cookies[configService.getEnvSettings().AuthCookieName],
      ]),
      secretOrKey: configService.getEnvSettings().AuthEncKey,
    });
  }

  async validate(payload: IGoogleUser) {
    return payload;
  }
}
