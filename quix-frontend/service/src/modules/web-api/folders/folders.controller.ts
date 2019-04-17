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
import {QuixEventBus} from '../../event-sourcing/quix-event-bus';
import {FileActions, createFolder} from '../../../../../shared/entities/file';
import uuid from 'uuid/v4';

@Controller('/api')
export class FoldersController {
  constructor(
    private foldersService: FoldersService,
    private authService: AuthService,
    private quixEventBus: QuixEventBus,
  ) {}

  @Get('files')
  async getFullTree(@Req() req: Request) {
    const {email} = await this.authService.getUser(req);
    let list = await this.foldersService.getFilesForUser(email);

    if (!list.length) {
      await this.createRootFolder(email);
      list = await this.foldersService.getFilesForUser(email);
    }

    return list;
  }

  @Get('files/:id')
  async GetSpecificFolder(@Param('id') id: string, @Req() req: Request) {
    const {email} = await this.authService.getUser(req);
    const folder = this.foldersService.getFolder(id);
    if (!folder) {
      throw new HttpException(`Can't find folder`, HttpStatus.NOT_FOUND);
    }
    return folder;
  }

  createRootFolder(user: string) {
    const id = uuid();
    return this.quixEventBus.emit({
      ...FileActions.createFile(
        id,
        createFolder([], {id, name: 'My Notebooks'}),
      ),
      user,
    });
  }
}
