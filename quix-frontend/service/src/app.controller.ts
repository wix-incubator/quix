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
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    });
  
  }

  private async getAuthorizationUrl(code_verifier: string) {
    const client = await this.getIssuerClient();
    const code_challenge = generators.codeChallenge(code_verifier);

    return client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state: 'true',
    });
  }

  @Get()
  @Render('index.vm')
  async getIndex(@Res() res: Response, @Req() req: any) {
    if (!this.clientConfig) {
      throw new Error('Server not up yet');
    }

    const clientTopology = this.clientConfig.getClientTopology();
    const mode = this.clientConfig.getMode();

    const code_verifier = generators.codeVerifier();
    const {OpenIdClientSecret} = this.configService.getEnvSettings();
    const cryptr = new Cryptr(OpenIdClientSecret);
    res.cookie('code_verifier', cryptr.encrypt(code_verifier), {
      httpOnly: true,
    });
    const authoriztionUrl = await this.getAuthorizationUrl(code_verifier);
    return {
      clientTopology,
      mode,
      quixConfig: this.clientConfig.serialize(),
    };
  }

  @Get('/openid-code')
  async openIdCodeHandler(@Res() res: Response, @Req() req: any) {
    const {
      OpenIdClientSecret,
      OpenIdRedirectUrl,
    } = this.configService.getEnvSettings();
    const client = await this.getIssuerClient();
    const params = client.callbackParams(req);
    const cryptr = new Cryptr(OpenIdClientSecret);
    const code_verifier = cryptr.decrypt(req.cookies['code_verifier']);
    const tokenset = await client.callback(OpenIdRedirectUrl, params, { code_verifier, state: 'true' });
    res.send({...tokenset.claims(), return_url: req.query.return_url});
  }

  @Get('/health/is_alive')
  async healthcheck(@Res() response: Response) {
    await this.conn
      .query(`SELECT 'health-check' FROM dual LIMIT 1`)
      .then(() => response.sendStatus(200).end())
      .catch(() => response.sendStatus(500).end());
  }
}
