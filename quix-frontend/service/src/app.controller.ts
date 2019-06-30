import {Controller, Get, Render, Res, Req} from '@nestjs/common';
import {ConfigService, EnvSettings} from './config';
import {InjectConnection} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import {Response} from 'express';
import {ClientConfigHelper} from 'shared';

@Controller()
export class AppController {
  private settings: EnvSettings;
  private clientConfig: ClientConfigHelper | undefined;

  constructor(
    private configService: ConfigService,
    @InjectConnection() private conn: Connection,
  ) {
    this.settings = this.configService.getEnvSettings();
    this.fetchClientConfig();
    setInterval(() => this.fetchClientConfig.bind(this), 1000 * 60 * 10);
  }

  private fetchClientConfig() {
    this.configService.getClientConfig().then(c => (this.clientConfig = c));
  }

  @Get()
  @Render('index.vm')
  getIndex() {
    if (!this.clientConfig) {
      throw new Error('Server not up yet');
    }

    const clientTopology = this.clientConfig.getClientTopology();
    const mode = this.clientConfig.getMode();

    return {
      clientTopology,
      mode,
      quixConfig: this.clientConfig.serialize(),
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
