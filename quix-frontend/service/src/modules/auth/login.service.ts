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

@Injectable()
export class LoginService {
  login: (
    authCode: string,
    req: Request,
    res: Response,
  ) => Promise<IExternalUser | undefined>;
  constructor(
    @Inject(AuthOptions) authOptions: AuthOptions,
    jwtService: JwtService,
  ) {
    switch (authOptions.type) {
      case AuthTypes.CUSTOM:
        this.login = customLogin(authOptions);
        break;
      case AuthTypes.GOOGLE:
        this.login = googleLogin(authOptions, jwtService);
        break;
      case AuthTypes.FAKE:
        this.login = fakeLogin(authOptions);
    }
  }
}

const fakeLogin = (authOptions: FakeAuthOptions) => (
  authCode: string,
  req: Request,
  res: Response,
) => {
  const up: IExternalUser = JSON.parse(authCode);

  res.cookie(
    authOptions.cookieName,
    Buffer.from(JSON.stringify(up)).toString('base64'),
    {
      maxAge: 24 * 60 * 1000,
    },
  );
  return Promise.resolve(up);
};

const customLogin = (authOptions: CustomAuthOptions) => (
  authCode: string,
  req: Request,
  res: Response,
) => {
  return authOptions.auth.login(authCode, req, res);
};

const googleLogin = (
  authOptions: GoogleAuthOptions,
  jwtService: JwtService,
) => async (authCode: string, req: Request, res: Response) => {
  const clientId = authOptions.googleClientId;
  const clientSecret = authOptions.googleAuthSecret;

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
    const jwtToken = await jwtService.signAsync(up);

    res.cookie(authOptions.cookieName, jwtToken, {
      maxAge: authOptions.cookieTTL,
    });
    return up;
  }
};
