import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {FoldersService} from './folders.service';
import {QuixEventBus} from '../../event-sourcing/quix-event-bus';
import {UserProfile, User} from 'modules/auth';
import {AuthGuard} from '@nestjs/passport';

@Controller('/api')
@UseGuards(AuthGuard())
export class FoldersController {
  constructor(
    private foldersService: FoldersService,
    private quixEventBus: QuixEventBus,
  ) {}

  @Get('files')
  async getFullTree(@User() user: UserProfile) {
    const {email} = user;
    const list = await this.foldersService.getFilesForUser(email);

    return list;
  }

  @Get('files/:id')
  async GetSpecificFolder(@Param('id') id: string) {
    const folder = this.foldersService.getFolder(id);
    if (!folder) {
      throw new HttpException(`Can't find folder`, HttpStatus.NOT_FOUND);
    }
    return folder;
  }
}
