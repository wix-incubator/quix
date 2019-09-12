import {Controller, Get, Logger, Query, Res, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ConfigService, EnvSettings} from 'config';
import {Response} from 'express';
import {AuthService} from './auth.service';
import {IGoogleUser} from './types';
import {User} from './user-decorator';
import {UsersService} from './users.service';
import {Issuer, generators} from 'openid-client';
import Cryptr from 'cryptr';

@Controller('/api/')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly envSettings: EnvSettings;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.envSettings = this.configService.getEnvSettings();
  }

  @Get('user')
  @UseGuards(AuthGuard())
  async getUser(@User() user: IGoogleUser) {
    await this.userService.doUserLogin(user);
    return user;
  }

  @Get('authenticate')
  async doAuth(@Query('code') code: string, @Res() response: Response) {
    try {
      const up = await this.authService.getUserProfileFromCode(code);
      if (up) {
        const token = await this.authService.createUserJwtToken(up);
        response.cookie(this.envSettings.AuthCookieName, token, {
          maxAge: this.envSettings.CookieAge,
        });
        await this.userService.doUserLogin(up);
        response.json(up);
        return;
      }
      response.sendStatus(401).send();
    } catch (e) {
      this.logger.error(e);
      response.sendStatus(500).send();
    }
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
  @Get('authenticate-openid')
  async doAuthOpenid(@Res() response: Response, @Req() req: any) {
    try {const {
      OpenIdClientSecret,
      OpenIdRedirectUrl,
      AuthCookieName,
      CookieAge
    } = this.configService.getEnvSettings();
    const client = await this.getIssuerClient();
    const params = client.callbackParams(req);
    const cryptr = new Cryptr(OpenIdClientSecret);
    const code_verifier = cryptr.decrypt(req.cookies['code_verifier']);
    const openidStateString = req.cookies['__quixOpenidState'];
    const openidState = openidStateString ? JSON.parse(openidStateString) : null;
    const state = req.query.state;
    if (openidState && openidState[state]) {
      const tokenset = await client.callback(OpenIdRedirectUrl, params, { code_verifier, state });
      const up = await this.authService.getUserProfileFromCode(JSON.stringify(tokenset.claims()));
      
        if (up) {
          const token = await this.authService.createUserJwtToken(up);
          response.cookie(AuthCookieName, token, {
            maxAge: CookieAge,
          });
          // await this.userService.doUserLogin(up);
          //response.json(up);
          const redirectUrl = openidState[state].redirectUrl || '/';
          response.redirect(redirectUrl, 302);
          return;
        }
        response.sendStatus(401).send();
    }
      response.sendStatus(401).send();

      // response.send({...tokenset.claims(), return_url: req.query.return_url});

    } catch (e) {
      this.logger.error(e);
      response.sendStatus(500).send();
    }
  }
}
