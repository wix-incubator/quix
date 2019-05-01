import {Controller, Get, Logger, Query, Res, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ConfigService, EnvSettings} from 'config';
import {Response} from 'express';
import {AuthService} from './auth.service';
import {UserProfile} from './types';
import {User} from './user-decorator';

class BaseAuthController {
  @Get('user')
  @UseGuards(AuthGuard())
  async getUser(@User() user: UserProfile) {
    return user;
  }
}
@Controller('/api/')
export class AuthController extends BaseAuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly envSettings: EnvSettings;
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super();
    this.envSettings = this.configService.getEnvSettings();
  }

  @Get('authenticate')
  async doAuth(@Query('code') code: string, @Res() response: Response) {
    try {
      const up = await this.authService.getUserProfileFromCode(code);
      if (up) {
        const token = await this.authService.createUserJwtToken(up);
        response.cookie(this.envSettings.AuthCookieName, token, {
          maxAge: this.envSettings.CookieAge,
        });
        response.json(up);
        return;
      }
      response.sendStatus(401).send();
    } catch (e) {
      this.logger.error(e);
      response.sendStatus(500).send();
    }
  }
}

@Controller('/api/')
export class FakeAuthController extends BaseAuthController {}
