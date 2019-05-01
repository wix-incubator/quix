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
  DbType: 'DB_TYPE',
  FakeAuth: 'FAKE_AUTH',
  AutoMigrateDb: 'DB_AUTO_MIGRATE',
  UseMinifiedStatics: 'MINIFIED_STATICS',
};

const envSettingsDefaults = {
  DbType: 'mysql' as 'mysql' | 'sqlite',
  FakeAuth: false,
  DbName: 'Quix',
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
  DbType: 'sqlite',
  FakeAuth: true,
  AutoMigrateDb: true,
  UseMinifiedStatics: false,
};

const identity = <T>(x: T) => x;
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
  FakeAuth: s => (s ? !!s : undefined),
  DbName: identity,
  DbUser: identity,
  DbPass: identity,
  DbHost: identity,
  DbPort: s => (s ? parseInt(s, 10) : undefined),
  QuixBackendInternalUrl: identity,
  QuixBackendPublicUrl: identity,
  GoogleClientId: identity,
  GoogleAuthSecret: identity,
  AuthCookieName: identity,
  AuthEncKey: identity,
  CookieAge: s => (s ? parseInt(s, 10) : undefined),
  AutoMigrateDb: s => (s ? !!s : undefined),
  UseMinifiedStatics: s => (s ? !!s : undefined),
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
