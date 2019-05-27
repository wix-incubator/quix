import {Controller, Get, Render, Res} from '@nestjs/common';
import {ConfigService, EnvSettings} from './config';
import {InjectConnection} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import {Response} from 'express';

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
  getIndex() {
    return {
      clientTopology: {
        staticsBaseUrl: '',
        quixBackendUrl: this.settings.QuixBackendPublicUrl,
        googleClientId: this.settings.GoogleClientId,
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
