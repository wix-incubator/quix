import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {IUser} from 'shared';
import {User} from 'modules/auth';
import {NotebookService} from './notebooks.service';
import {AuthGuard} from '@nestjs/passport';
import {DemoModeInterceptor} from 'common/demo-mode-interceptor';

@Controller('/api/notebook')
@UseInterceptors(DemoModeInterceptor)
export class NotebookController {
  constructor(private notebookService: NotebookService) {}

  @Get(':id')
  @UseGuards(AuthGuard())
  async getNotebook(@User() user: IUser, @Param('id') id: string) {
    const notebook = await this.notebookService.getNotebook(user.email, id);

    if (!notebook) {
      throw new HttpException(`Can't find notebook`, HttpStatus.NOT_FOUND);
    }

    return notebook;
  }
}
