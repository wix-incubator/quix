import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {SearchService} from 'modules/search/search';

@Controller('/api/search')
@UseGuards(AuthGuard())
export class SearchControllerWithPagination {
  constructor(private searchService: SearchService) {}

  @Get('/:term')
  async doSearch(
    @Param('term') query: string,
    @Query('offset', new ParseIntPipe()) offset: number,
    @Query('total', new ParseIntPipe()) count: number,
  ) {
    const [notes, totalNotesInSearch] = await this.searchService.search(
      query,
      count,
      offset,
    );
    return {notes, count: totalNotesInSearch};
  }
}
