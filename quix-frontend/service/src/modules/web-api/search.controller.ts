import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {SearchService} from 'modules/search/search';
import {DemoModeInterceptor} from 'common/demo-mode-interceptor';

@Controller('/api/search')
@UseInterceptors(DemoModeInterceptor)
@UseGuards(AuthGuard())
export class SearchController {
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
