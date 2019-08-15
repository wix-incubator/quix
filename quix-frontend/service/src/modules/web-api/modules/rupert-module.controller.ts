import fetch from 'node-fetch';
import {
  Param,
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

import {AuthGuard} from '@nestjs/passport';
import {ConfigService} from 'config';

@Controller('/api/module/rupert/question/:id')
export class ModulesController {
  constructor(private configService: ConfigService) {}

  @Get()
  @UseGuards(AuthGuard())
  @HttpCode(200)
  async getQuestion(@Param('id') questionId: string) {
    try {
      const {RupertApiUrl, RupertApiKey} = this.configService.getEnvSettings();
      const url = `${RupertApiUrl}/question/${questionId}?source=quix`;
      const authHeader = `Basic ${new Buffer(RupertApiKey + ':').toString(
        'base64',
      )}`;

      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
        },
      }).then(r => {
        if (!r.ok) {
          throw new HttpException(r.statusText, r.status);
        }

        return r.json();
      });

      return res;
    } catch (e) {
      throw new HttpException('Bad Gateway', HttpStatus.BAD_GATEWAY);
    }
  }
}
