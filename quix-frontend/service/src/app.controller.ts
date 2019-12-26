import {
  Controller,
  Get,
  Render,
  Res,
  Req,
  OnApplicationShutdown,
} from '@nestjs/common';
import {ConfigService, EnvSettings} from './config';
import {InjectConnection} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import {Response} from 'express';
import {ClientConfigHelper} from 'shared';
import {Issuer, generators} from 'openid-client';
import Cryptr from 'cryptr';

@Controller()
export class AppController implements OnApplicationShutdown {
  private clientConfig: ClientConfigHelper | undefined;
  private timer: NodeJS.Timer;

  constructor(
    private configService: ConfigService,
    @InjectConnection() private conn: Connection,
  ) {
    this.fetchClientConfig();
    this.timer = setInterval(
      () => this.fetchClientConfig.bind(this),
      1000 * 60 * 10,
    );
  }

  onApplicationShutdown() {
    clearInterval(this.timer);
  }

  private fetchClientConfig() {
    this.configService.getClientConfig().then(c => (this.clientConfig = c));
  }

  private async getIssuerClient() {
    const {
      OpenIdDiscoveryDoc,
      OpenIdClientId,
      OpenIdClientSecret,
      OpenIdRedirectUrl,
    } = this.configService.getEnvSettings();
    const discoverdIssuer = await Issuer.discover(OpenIdDiscoveryDoc);
    return new discoverdIssuer.Client({
      client_id: OpenIdClientId,
      client_secret: OpenIdClientSecret,
      redirect_uris: [OpenIdRedirectUrl],
      response_types: ['code'],
    });
  }

  private async getAuthorizationUrl(res: Response) {
    const {OpenIdClientSecret} = this.configService.getEnvSettings();
    const codeVerifier = generators.codeVerifier();

    const cryptr = new Cryptr(OpenIdClientSecret);
    res.cookie('code_verifier', cryptr.encrypt(codeVerifier), {
      httpOnly: true,
    });

    const client = await this.getIssuerClient();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    return client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
  }

  @Get()
  @Render('index.vm')
  async getIndex(@Res() res: Response, @Req() req: any) {
    const {AuthType} = this.configService.getEnvSettings();

    if (!this.clientConfig) {
      throw new Error('Server not up yet');
    }

    const clientTopology = this.clientConfig.getClientTopology();
    const mode = this.clientConfig.getMode();

    if (AuthType === 'openid') {
      const authorizationUrl = await this.getAuthorizationUrl(res);
      this.clientConfig.setAuth({
        googleClientId: '',
        authType: 'openid',
        openidAuthUrl: authorizationUrl,
      });
    }

    return {
      clientTopology,
      mode,
      quixConfig: this.clientConfig.serialize(),
    };
  }

  @Get('/health/is_alive')
  async healthCheck(@Res() response: Response) {
    await this.conn
      .query(`SELECT 'health-check' FROM dual LIMIT 1`)
      .then(() => response.sendStatus(200).end())
      .catch(() => response.sendStatus(500).end());
  }
}
