import md5 from 'md5';
import fetch from 'node-fetch';
import {
  Param,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

import {AuthGuard} from '@nestjs/passport';
import {User, IGoogleUser} from 'modules/auth';
import {ConfigService} from 'config';

@Controller('/api/module/rupert/question/:id')
export class ModulesController {
  constructor(private configService: ConfigService) {}

  private getRupertUrl(questionId: string, suffix = '') {
    const {RupertApiUrl} = this.configService.getEnvSettings();

    return `${RupertApiUrl}/question/${questionId}${suffix}`;
  }

  private getRupertHeaders(user: IGoogleUser) {
    const {RupertApiKey, RupertApiSecret} = this.configService.getEnvSettings();

    const authHeader = `Basic ${new Buffer(RupertApiKey + ':').toString('base64')}`;
    const userHeader = md5(`${user.email}${RupertApiSecret}`);

    return {
      Authorization: authHeader,
      'user-email': userHeader,
      'Content-Type': 'application/json',
    };
  }

  @Get()
  @UseGuards(AuthGuard())
  @HttpCode(200)
  async getQuestion(
    @User() user: IGoogleUser,
    @Param('id') questionId: string,
  ) {
    const url = this.getRupertUrl(questionId, '?source=quix');
    const options = {
      headers: this.getRupertHeaders(user),
    };

    const res = await fetch(url, options).then(r => {
      if (!r.ok) {
        throw new HttpException(r.statusText, r.status);
      }

      return r.json();
    });

    return res;
  }

  @Post('/statistics')
  @UseGuards(AuthGuard())
  @HttpCode(200)
  async reportStatistics(
    @User() user: IGoogleUser,
    @Param('id') questionId: string,
    @Body() payload: any,
  ) {
    const url = this.getRupertUrl(questionId, '/statistics');

    payload = {
      source: 'quix',
      execution_time: payload.execution_time,
      rows: payload.rows,
      failure: payload.failure,
      extra_data: {
        note_id: payload.extra_data.note_id,
        note_contents: md5(payload.extra_data.note_contents),
      },
    };

    const options = {
      method: 'post',
      headers: this.getRupertHeaders(user),
      body: JSON.stringify(payload),
    };

    await fetch(url, options).then(r => {
      if (!r.ok) {
        throw new HttpException(r.statusText, r.status);
      }

      return r.json();
    });
  }
}
