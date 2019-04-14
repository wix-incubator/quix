import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {NotebookService} from './notebooks.service';

@Controller('/api/notebook')
export class NotebookController {
  constructor(private notebookService: NotebookService) {}

  @Get(':id')
  async getNotebook(@Param('id') id: string) {
    const notebook = await this.notebookService.getId(id);
    if (!notebook) {
      throw new HttpException(`Can't find notebook`, HttpStatus.NOT_FOUND);
    }
    return notebook;
  }
}
