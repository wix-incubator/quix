import {
  Controller,
  Get,
  Param,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {FoldersService} from './folders.service';
import {AuthService} from '../../auth/auth.service';
import {Request} from 'express';

@Controller('/api')
export class FoldersController {
  constructor(
    private foldersService: FoldersService,
    private authService: AuthService,
  ) {}

  @Get('files')
  async getFullTree(@Req() req: Request) {
    const {email} = await this.authService.getUser(req);
    const list = this.foldersService.getPathList(email);
    if (!list) {
      throw new HttpException(`Can't find folder`, HttpStatus.NOT_FOUND);
    }
    return list;
  }

  @Get('files/:id')
  async GetSpecificFolder(@Param('id') id: string, @Req() req: Request) {
    const {email} = await this.authService.getUser(req);
    const list = this.foldersService.getPathList(email, id);
    if (!list) {
      throw new HttpException(`Can't find folder`, HttpStatus.NOT_FOUND);
    }
    return list;
  }
}
