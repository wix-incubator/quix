import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Search} from './search';
import {Repository} from 'typeorm';
import {DbNote} from '../../entities';
import {AuthGuard} from '@nestjs/passport';

@Controller('/api/search')
@UseGuards(AuthGuard())
export class SearchController {
  private searchService: Search;

  constructor(
    @InjectRepository(DbNote)
    private readonly noteRepository: Repository<DbNote>,
  ) {
    this.searchService = new Search(this.noteRepository);
  }

  @Get('/:term')
  doSearch(@Param('term') query: string) {
    return this.searchService.search(query);
  }
}
