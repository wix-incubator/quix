import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
import {Request} from 'express';
import {ConfigService} from 'config';
import {JwtService} from '@nestjs/jwt';
import {UserProfile} from './types';
import {OAuth2Client} from 'google-auth-library';

@Injectable()
export class AuthService {
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

  createUserJwtToken(userProfile: UserProfile) {
    return this.jwtService.signAsync(userProfile);
  }

  async getUserProfileFromCode(authCode: string) {
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
      const up: UserProfile = {
        avatar: payload.picture,
        name: payload.name,
        email: payload.email,
        id: payload.sub,
      };
      return up;
    }
  }
}
