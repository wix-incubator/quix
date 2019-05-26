import dotenv from 'dotenv';
import {isJestTest} from './utils';
import path from 'path';
import {defaults} from 'lodash';

let enviormentLoaded = false;
export const loadEnv = () => {
  if (!enviormentLoaded) {
    if (isJestTest()) {
      dotenv.config({path: path.resolve(process.cwd(), '.testenv')});
    } else {
      dotenv.config();
    }
    enviormentLoaded = true;
  }
};

const envSettingsMap: {[K in keyof EnvSettings]: string} = {
  DbType: 'DB_TYPE',
  AuthType: 'AUTH_TYPE',
  RunMode: 'default',
  DbName: 'DB_NAME',
  DbUser: 'DB_USER',
  DbPass: 'DB_PASS',
  DbHost: 'DB_HOST',
  DbPort: 'DB_PORT',
  QuixBackendInternalUrl: 'BACKEND_INTERNAL_URL',
  QuixBackendPublicUrl: 'BACKEND_PUBLIC_URL',
  GoogleClientId: 'GOOGLE_SSO_CLIENT_ID',
  GoogleAuthSecret: 'GOOGLE_SSO_SECRET',
  AuthCookieName: 'AUTH_COOKIE',
  AuthEncKey: 'AUTH_SECRET',
  CookieAge: 'COOKIE_MAX_AGE',
  AutoMigrateDb: 'DB_AUTO_MIGRATE',
  UseMinifiedStatics: 'MINIFIED_STATICS',
};

const envSettingsDefaults = {
  DbType: 'mysql' as 'mysql' | 'sqlite',
  AuthType: 'fake' as 'fake' | 'google',
  RunMode: 'demo' as 'demo' | 'normal',
  DbName: 'quix',
  DbUser: 'root',
  DbPass: '',
  DbHost: 'db',
  DbPort: 3306,
  QuixBackendInternalUrl: 'backend:8081',
  QuixBackendPublicUrl: 'localhost:8081',
  GoogleClientId: '',
  GoogleAuthSecret: '',
  AuthCookieName: '__quix',
  AuthEncKey: '123456',
  CookieAge: 30 * 24 * 60 * 60 * 1000 /* 30 days */,
  AutoMigrateDb: true,
  UseMinifiedStatics: true,
};

const testingDefaults: EnvSettings = {
  DbType: 'sqlite',
  AuthType: 'fake',
  RunMode: 'normal',
  DbName: 'quixtest',
  DbUser: 'root',
  DbPass: '',
  DbHost: 'localhost',
  DbPort: 3306,
  QuixBackendInternalUrl: 'localhost:8081',
  QuixBackendPublicUrl: 'localhost:8081',
  GoogleClientId: '',
  GoogleAuthSecret: '',
  AuthCookieName: '__quix',
  AuthEncKey: '',
  CookieAge: 30 * 24 * 60 * 60 * 1000,
  AutoMigrateDb: true,
  UseMinifiedStatics: false,
};

const identity = <T>(x: T) => x;
const numberParse = (s: string | undefined) =>
  s ? parseInt(s, 10) : undefined;
const booleanParse = (s: string | undefined) =>
  s !== undefined
    ? s.toLowerCase() === 'false' || s === ''
      ? false
      : true
    : undefined;

const transforms: {
  [K in keyof EnvSettings]: (
    s: string | undefined,
  ) => EnvSettings[K] | undefined
} = {
  DbType: s => {
    switch (s) {
      case 'sqlite':
      case 'mysql':
        return s;
      case undefined:
      case '':
        return undefined;
      default:
        throw new Error('Unknown DB type.');
    }
  },
  AuthType: s => {
    switch (s) {
      case 'google':
      case 'fake':
        return s;
      case undefined:
      case '':
        return undefined;
      default:
        throw new Error('Unknown Auth type.');
    }
  },
  RunMode: identity as any,
  DbName: identity,
  DbUser: identity,
  DbPass: identity,
  DbHost: identity,
  DbPort: numberParse,
  QuixBackendInternalUrl: identity,
  QuixBackendPublicUrl: identity,
  GoogleClientId: identity,
  GoogleAuthSecret: identity,
  AuthCookieName: identity,
  AuthEncKey: identity,
  CookieAge: numberParse,
  AutoMigrateDb: booleanParse,
  UseMinifiedStatics: booleanParse,
};

let env: EnvSettings;

export const getEnv = (): EnvSettings => {
  loadEnv();
  return (
    env ||
    (env = defaults(
      Object.entries(envSettingsMap).reduce(
        (settings, [key, envVar]) => {
          settings[key] = transforms[key as keyof EnvSettings](
            process.env[envVar],
          );
          return settings;
        },
        {} as any,
      ),
      isJestTest() ? testingDefaults : envSettingsDefaults,
    ))
  );
};

export type EnvSettings = typeof envSettingsDefaults;
