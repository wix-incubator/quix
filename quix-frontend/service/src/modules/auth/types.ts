import {ModuleMetadata, Type} from '@nestjs/common';
import {Response, Request} from 'express';
import {JwtModuleOptions} from '@nestjs/jwt';
import http from 'http';
/**
 * Quix authentication works by authenticating the user vs some external service (currently just google, openconnect in the future)
 * Then writing this identity into a cookie (JWT or otherwise) and into an internal user entity persisted in db
 * This is the payload we expect from an external service
 */
export interface IExternalUser {
  id: string;
  email: string;
  avatar?: string;
  name?: string;
}

export interface CustomAuth {
  login(
    clientPayload: string,
    req: Request,
    res: Response,
  ): Promise<IExternalUser | undefined>;
  verify(token: string): IExternalUser | undefined; // currently websocket code prevent us from using promise here
  getTokenFromRequest(request: http.IncomingMessage): string;
}

export enum AuthTypes {
  CUSTOM = 0,
  FAKE = 1,
  GOOGLE = 2,
}

export type FakeAuthOptions = {
  type: AuthTypes.FAKE;
  cookieName: string;
};
export type GoogleAuthOptions = {
  type: AuthTypes.GOOGLE;
  cookieName: string;
  cookieTTL: number;
  cookieEncKey: string;
  googleClientId: string;
  googleAuthSecret: string;
};

export type CustomAuthOptions = {
  type: AuthTypes.CUSTOM;
  auth: CustomAuth;
  jwtServiceOptions?: JwtModuleOptions;
};

export type AuthOptions =
  | FakeAuthOptions
  | GoogleAuthOptions
  | CustomAuthOptions;

// export interface AuthOptionsFactory {
//   createAuthOptions(): Promise<AuthOptions> | AuthOptions;
// }
export interface AuthAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  // useExisting?: Type<AuthOptionsFactory>; //To implement later, if needed
  // useClass?: Type<AuthOptionsFactory>;
  useFactory: (...args: any[]) => Promise<AuthOptions> | AuthOptions;
  injects?: any[];
}

export const AuthOptions = 'AuthOptions';
