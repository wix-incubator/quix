import {Injectable, Inject} from '@nestjs/common';
import {Response, Request} from 'express';
import {ConfigService} from '../../config';
import {JwtService} from '@nestjs/jwt';
import {
  AuthOptions,
  AuthTypes,
  CustomAuthOptions,
  FakeAuthOptions,
  GoogleAuthOptions,
  IExternalUser,
} from './types';
import {OAuth2Client} from 'google-auth-library';
import {fakeAuth} from './common-auth';

export abstract class LoginService {
  abstract login(
    clientPayload: string,
    req: Request,
    res: Response,
  ): Promise<IExternalUser | undefined>;

  abstract verify(token: string): IExternalUser | undefined;
}

export class FakeLoginService extends LoginService {
  constructor(
    @Inject(AuthOptions) private readonly authOptions: FakeAuthOptions,
  ) {
    super();
  }

  verify(token: string) {
    return fakeAuth(token);
  }

  login(
    authCode: string,
    req: Request,
    res: Response,
  ): Promise<IExternalUser | undefined> {
    const up: IExternalUser = JSON.parse(authCode);

    res.cookie(
      this.authOptions.cookieName,
      Buffer.from(JSON.stringify(up)).toString('base64'),
      {
        maxAge: 24 * 60 * 1000,
      },
    );
    return Promise.resolve(up);
  }
}

export class CustomLoginService extends LoginService {
  constructor(
    @Inject(AuthOptions) private readonly authOptions: CustomAuthOptions,
  ) {
    super();
  }

  verify(token: string) {
    return this.authOptions.auth.verify(token);
  }

  login(
    authCode: string,
    req: Request,
    res: Response,
  ): Promise<IExternalUser | undefined> {
    return this.authOptions.auth.login(authCode, req, res);
  }
}

export class GoogleLoginService extends LoginService {
  constructor(
    @Inject(AuthOptions) private readonly authOptions: GoogleAuthOptions,
    private jwtService: JwtService,
  ) {
    super();
  }

  verify(token: string) {
    return this.jwtService.verify(token);
  }

  async login(
    authCode: string,
    req: Request,
    res: Response,
  ): Promise<IExternalUser | undefined> {
    {
      const clientId = this.authOptions.googleClientId;
      const clientSecret = this.authOptions.googleAuthSecret;

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
        const up: IExternalUser = {
          avatar: payload.picture,
          name: payload.name,
          email: payload.email,
          id: payload.sub,
        };
        const jwtToken = await this.jwtService.signAsync(up);

        res.cookie(this.authOptions.cookieName, jwtToken, {
          maxAge: this.authOptions.cookieTTL,
        });
        return up;
      }
    }
  }
}
