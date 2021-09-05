import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { IUser } from '@wix/quix-shared';
import { User } from '../../../modules/auth';
import { AuthGuard } from '../../auth';
import { DemoModeInterceptor } from '../../../common/demo-mode-interceptor';
import { DeletedNotebooksService } from './deleted-notebook.service';

@Controller('/api/deletedNotebooks')
@UseInterceptors(DemoModeInterceptor)
export class DeletedNotebooksController {
  constructor(private deletedNotebooksService: DeletedNotebooksService) { }

  @Get()
  @UseGuards(AuthGuard)
  async getUserDeletedNotebooks(@User() user: IUser) {
    return this.deletedNotebooksService.getDeletedNotebooksForUser(user.email);
  }
}
