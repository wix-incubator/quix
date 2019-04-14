import {Controller, Get, Inject, Query, Req} from '@nestjs/common';
import {Request} from 'express';
import {AuthService} from './auth.service';

@Controller('/api/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('user')
  async getUser(@Req() request: Request) {
    const user = await this.authService.getUser(request);
    return user;
  }

  @Get('/authenticate')
  async doAuth(@Query('code') code: string) {
    return;
  }
}
