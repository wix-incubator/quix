import {
  Controller,
  Get,
  Logger,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import {AuthGuard} from './user-decorator';
import {Response, Request} from 'express';
import {LoginService} from './login.service';
import {IExternalUser} from './types';
import {User} from './user-decorator';
import {UsersService} from './users.service';

@Controller('/api/')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: LoginService,
    private readonly userService: UsersService,
  ) {}

  @Get('user')
  @UseGuards(AuthGuard)
  async getUser(@User() user: IExternalUser) {
    this.userService.doUserLogin(user).catch(e => {
      this.logger.error('error updating user', e);
    });
    return user;
  }

  @Get('authenticate')
  async doAuth(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const up = await this.authService.login(code, req, res);
      if (up) {
        await this.userService.doUserLogin(up);
        res.json(up);
        return;
      }
      res.sendStatus(401).send();
    } catch (e) {
      this.logger.error(e);
      res.sendStatus(500).send();
    }
  }
}
