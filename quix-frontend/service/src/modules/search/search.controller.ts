import {Controller, Get, Query} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Search} from './search';
import {Repository} from 'typeorm';
import {DbNote} from '../../entities';

@Controller('/api/search')
export class SearchController {
  private searchService: Search;

  constructor(
    @InjectRepository(DbNote)
    private readonly noteRepository: Repository<DbNote>,
  ) {
    this.searchService = new Search(this.noteRepository);
  }

  @Get()
  doSearch(@Query('query') query: string) {
    return this.searchService.search(query);
  }
}
