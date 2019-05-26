import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {EnvSettings, ConfigService} from 'config';
import {SearchService} from 'modules/search/search';
import {sanitizeUserEmail} from 'utils/sanitizer';

@Controller('/api/search')
@UseGuards(AuthGuard())
export class SearchController {
  private readonly envSettings: EnvSettings;

  constructor(
    private readonly configService: ConfigService,
    private searchService: SearchService,
  ) {
    this.envSettings = this.configService.getEnvSettings();
  }

  @Get('/:term')
  async doSearch(
    @Param('term') query: string,
    @Query('offset', new ParseIntPipe()) offset: number,
    @Query('total', new ParseIntPipe()) count: number,
  ) {
    const res = await this.searchService.search(query, count, offset);

    const notes =
      this.envSettings.RunMode === 'demo'
        ? res[0].map(note => ({
            ...note,
            owner: sanitizeUserEmail(note.owner),
          }))
        : res[0];

    return {
      notes,
      count: res[1],
    };
  }
}
