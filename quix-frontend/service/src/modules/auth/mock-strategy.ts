import {Strategy as BaseStrategy} from 'passport-strategy';
import {Request} from 'express';
import {IGoogleUser} from './types';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from 'config';

const defaultUser: IGoogleUser = {
  email: 'user@quix.com',
  id: '1',
  name: 'Default User',
};

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
    if (cookies[this.cookieName]) {
      try {
        const user = JSON.parse(
          Buffer.from(cookies[this.cookieName], 'base64').toString(),
        );

        this.success(user);
      } catch (e) {
        this.logger.verbose(`Can't parse cookie, using default user.`);
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

  async validate(payload: IGoogleUser) {
    return payload;
  }
}
