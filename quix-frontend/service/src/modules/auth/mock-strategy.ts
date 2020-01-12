import {Strategy as BaseStrategy} from 'passport-strategy';
import {Request} from 'express';
import {IGoogleUser} from './types';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from 'config';
import {fakeAuth} from './common-auth';

class PassportFakeStrategy extends BaseStrategy {
  private readonly logger = new Logger(PassportFakeStrategy.name);
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
  constructor(configService: ConfigService) {
    super({cookieName: configService.getEnvSettings().AuthCookieName});
  }

  async validate(payload: IGoogleUser) {
    return payload;
  }
}
