import {Controller, Get, Logger, Query, Res, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ConfigService, EnvSettings} from 'config';
import {Response} from 'express';
import {AuthService} from './auth.service';
import {IGoogleUser} from './types';
import {User} from './user-decorator';
import {UsersService} from './users.service';

@Controller('/api/')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly envSettings: EnvSettings;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.envSettings = this.configService.getEnvSettings();
  }

  @Get('user')
  @UseGuards(AuthGuard())
  async getUser(@User() user: IGoogleUser) {
    await this.userService.doUserLogin(user);
    return user;
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
        await this.userService.doUserLogin(up);
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
