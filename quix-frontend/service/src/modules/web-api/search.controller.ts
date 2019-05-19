import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {SearchService} from 'modules/search/search';

@Controller('/api/search')
@UseGuards(AuthGuard())
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('/:term')
  doSearch(@Param('term') query: string) {
    return this.searchService.search(query);
  }
}
