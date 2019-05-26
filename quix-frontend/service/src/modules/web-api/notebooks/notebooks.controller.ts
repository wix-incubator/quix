import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {IUser} from 'shared/dist';
import {User} from 'modules/auth';
import {NotebookService} from './notebooks.service';
import {AuthGuard} from '@nestjs/passport';

@Controller('/api/notebook')
export class NotebookController {
  constructor(private notebookService: NotebookService) {}

  @Get(':id')
  @UseGuards(AuthGuard())
  async getNotebook(@User() user: IUser, @Param('id') id: string) {
    const notebook = await this.notebookService.getId(user.email, id);

    if (!notebook) {
      throw new HttpException(`Can't find notebook`, HttpStatus.NOT_FOUND);
    }

    return notebook;
  }
}
