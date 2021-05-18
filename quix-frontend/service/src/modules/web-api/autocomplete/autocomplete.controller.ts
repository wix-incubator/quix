import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import {AuthGuard} from '../../auth';
import {AutocompleteService} from './autocomplete.service';

@Controller('/api/autocomplete')
export class AutocompleteController {
  constructor(private autocompleteService: AutocompleteService) {}

  @Get(':type')
  @UseGuards(AuthGuard)
  getAutocompletions(@Param('type') type: string) {
    return this.autocompleteService.getAutocompletions(type);
  }
}
