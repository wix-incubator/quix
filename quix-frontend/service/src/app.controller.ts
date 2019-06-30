import {Controller, Get, Render, Res, Req} from '@nestjs/common';
import {ConfigService, EnvSettings} from './config';
import {InjectConnection} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import {Response, Request} from 'express';
import Url from 'url';

@Controller()
export class AppController {
  private settings: EnvSettings;
  constructor(
    private configService: ConfigService,
    @InjectConnection() private conn: Connection,
  ) {
    this.settings = this.configService.getEnvSettings();
  }

  @Get()
  @Render('index.vm')
  getIndex(@Req() request: Request) {
    return {
      clientTopology: {
        staticsBaseUrl: Url.parse(request.url).path || '',
        quixBackendUrl: this.settings.QuixBackendPublicUrl,
        googleClientId: this.settings.GoogleClientId,
        demoMode: this.settings.DemoMode,
      },
      debug: !this.configService.getEnvSettings().UseMinifiedStatics,
    };
  }

  @Get('/health/is_alive')
  async healthcheck(@Res() response: Response) {
    await this.conn
      .query(`SELECT 'health-check' FROM dual LIMIT 1`)
      .then(() => response.sendStatus(200).end())
      .catch(() => response.sendStatus(500).end());
  }
}
