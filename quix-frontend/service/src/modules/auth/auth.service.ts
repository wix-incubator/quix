import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
import {ConfigService} from 'config';
import {JwtService} from '@nestjs/jwt';
import {IGoogleUser} from './types';
import {OAuth2Client} from 'google-auth-library';
import {Request} from 'express';
import {UsersService} from './users.service';
import {Issuer, generators} from 'openid-client';
import Cryptr from 'cryptr';

export abstract class AuthService {
  abstract createUserJwtToken(userProfile: IGoogleUser): Promise<string>;
  abstract getUserProfileFromCode(
    res: Request,
  ): Promise<IGoogleUser | undefined>;
}

@Injectable()
export class FakeAuthService implements AuthService {
  getUserProfileFromCode(req: Request) {
    const authCode: string = req.query.code;
    const up: IGoogleUser = JSON.parse(authCode);
    return Promise.resolve(up);
  }

  createUserJwtToken(userProfile: IGoogleUser) {
    return Promise.resolve(
      Buffer.from(JSON.stringify(userProfile)).toString('base64'),
    );
  }
}

@Injectable()
export class GoogleAuthService implements AuthService {
  private googleClientId: string;
  private googleAuthSecret: string;
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const settings = this.configService.getEnvSettings();
    this.googleClientId = settings.GoogleClientId;
    this.googleAuthSecret = settings.GoogleAuthSecret;
  }

  createUserJwtToken(userProfile: IGoogleUser) {
    return this.jwtService.signAsync(userProfile);
  }

  async getUserProfileFromCode(req: Request) {
    const authCode: string = req.query.code;
    const clientId = this.googleClientId;
    const clientSecret = this.googleAuthSecret;

    const authClient = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri: 'postmessage',
    });
    const r = await authClient.getToken(authCode);
    authClient.setCredentials(r.tokens);

    const verify = await authClient.verifyIdToken({
      idToken: r.tokens.id_token || '',
      audience: clientId,
    });

    const payload = (verify && verify.getPayload()) || null;

    if (payload && payload.email && payload.sub) {
      const up: IGoogleUser = {
        avatar: payload.picture,
        name: payload.name,
        email: payload.email,
        id: payload.sub,
      };
      return up;
    }
  }
}

@Injectable()
export class OpenidAuthService implements AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const settings = this.configService.getEnvSettings();
  }

  createUserJwtToken(userProfile: IGoogleUser) {
    return this.jwtService.signAsync(userProfile);
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

  async getUserProfileFromCode(req: Request) {
    const {
      OpenIdClientSecret,
      OpenIdRedirectUrl,
      AuthCookieName,
      CookieAge,
    } = this.configService.getEnvSettings();

    const client = await this.getIssuerClient();
    const params = client.callbackParams(req);
    const cryptr = new Cryptr(OpenIdClientSecret);
    const codeVerifier = cryptr.decrypt(req.cookies.code_verifier);

    const openidStateString = req.cookies.__quixOpenidState;
    const openidState = openidStateString
      ? JSON.parse(openidStateString)
      : null;
    const state = req.query.state;

    if (openidState && openidState[state]) {
      const tokenSet = await client.callback(OpenIdRedirectUrl, params, {
        code_verifier: codeVerifier,
        state,
      });

      const userInfo = await client.userinfo(tokenSet);

      if (userInfo && userInfo.email && userInfo.sub) {
        const up: IGoogleUser = {
          avatar: userInfo.picture,
          name: userInfo.name,
          email: userInfo.email,
          id: userInfo.sub,
        };
        return up;
      }
    }
  }
}
