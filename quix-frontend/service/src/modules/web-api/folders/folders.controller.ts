import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {FoldersService} from './folders.service';
import {QuixEventBus} from '../../event-sourcing/quix-event-bus';
import {IGoogleUser, User} from 'modules/auth';
import {AuthGuard} from '@nestjs/passport';
import {DemoModeInterceptor} from 'common/demo-mode-interceptor';

@Controller('/api')
@UseGuards(AuthGuard())
@UseInterceptors(DemoModeInterceptor)
export class FoldersController {
  constructor(
    private foldersService: FoldersService,
    private quixEventBus: QuixEventBus,
  ) {}

  @Get('files')
  async getFullTree(@User() user: IGoogleUser) {
    const {email} = user;
    const list = await this.foldersService.getFilesForUser(email);

    return list;
  }

  @Get('files/:id')
  async getSpecificFolder(@Param('id') id: string) {
    const folder = this.foldersService.getFolder(id);
    if (!folder) {
      throw new HttpException(`Can't find folder`, HttpStatus.NOT_FOUND);
    }
    return folder;
  }
}
