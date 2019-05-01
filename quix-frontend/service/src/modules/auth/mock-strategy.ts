import {Strategy as BaseStrategy} from 'passport-strategy';
import {Request} from 'express';
import {UserProfile} from './types';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {ConfigService} from 'config';

const defaultUser: UserProfile = {
  email: 'user@quix.com',
  id: '1',
};

class PassportFakeStrategy extends BaseStrategy {
  public name: string = 'fake';
  private cookieName: string;
  constructor(options: {cookieName: string}) {
    super();
    this.cookieName = options.cookieName;
  }

  authenticate(req: Request) {
    if (req.cookies[this.cookieName]) {
      try {
        const user = JSON.parse(
          Buffer.from(req.cookies[this.cookieName], 'base64').toString(),
        );

        this.success(user);
      } catch (e) {
        this.success(defaultUser);
      }
    }
    this.success(defaultUser);
  }
}

@Injectable()
export class MockStrategy extends PassportStrategy(PassportFakeStrategy) {
  constructor(configService: ConfigService) {
    super({cookieName: configService.getEnvSettings().AuthCookieName});
  }

  async validate(payload: UserProfile) {
    return payload;
  }
}
