import {Inject, Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {ExtractJwt, Strategy as JwtStrategyBase} from 'passport-jwt';
import {Strategy as BaseStrategy} from 'passport-strategy';
import {fakeAuth} from './common-auth';
import {
  AuthOptions,
  CustomAuthOptions,
  FakeAuthOptions,
  GoogleAuthOptions,
  IExternalUser
} from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
  constructor(@Inject(AuthOptions) readonly authOptions: GoogleAuthOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        req => req.cookies[authOptions.cookieName],
      ]),
      secretOrKey: authOptions.cookieEncKey || '123456',
    });
  }

  async validate(payload: IExternalUser) {
    return payload;
  }
}

/*************/

class PassportFakeStrategy extends BaseStrategy {
  public name: string = 'fake';
  private cookieName: string;
  constructor(options: {cookieName: string}) {
    super();
    this.cookieName = options.cookieName;
  }

  authenticate(req: Request) {
    const cookies = req.cookies || {};
    const token = cookies[this.cookieName];
    const user = fakeAuth(token);
    this.success(user);
  }
}

@Injectable()
export class MockStrategy extends PassportStrategy(PassportFakeStrategy) {
  constructor(@Inject(AuthOptions) readonly authOptions: FakeAuthOptions) {
    super({cookieName: authOptions.cookieName});
  }

  async validate(payload: IExternalUser) {
    return payload;
  }
}
/***********/
class PassportCustomStrategy extends BaseStrategy {
  public name: string = 'custom';
  constructor(private authOptions: CustomAuthOptions) {
    super();
  }

  authenticate(req: Request) {
    return this.authOptions.auth.authenticate(req);
  }
}

@Injectable()
export class CustomStrategy extends PassportStrategy(PassportCustomStrategy) {
  constructor(@Inject(AuthOptions) authOptions: CustomAuthOptions) {
    super(authOptions);
  }

  async validate(payload: IExternalUser) {
    return payload;
  }
}
