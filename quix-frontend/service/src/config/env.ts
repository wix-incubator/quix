import dotenv from 'dotenv';
import {isJestTest} from './utils';
import path from 'path';
import {defaults} from 'lodash';
import {BaseConnectionOptions} from 'typeorm/connection/BaseConnectionOptions';

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

const envSettingsMap: {[K in keyof StaticSettings]: string} = {
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
  AuthType: 'AUTH_TYPE',
  AutoMigrateDb: 'DB_AUTO_MIGRATE',
  UseMinifiedStatics: 'MINIFIED_STATICS',
  DemoMode: 'DEMO_MODE',
  DbDebug: 'DB_DEBUG',
  Modules: 'MODULES',
  HttpPort: 'HTTP_PORT',
  MountPath: 'MOUNT_PATH',
};

const envSettingsDefaults = {
  DbType: 'mysql' as 'mysql' | 'sqlite',
  AuthType: 'fake' as 'fake' | 'google',
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
  AutoMigrateDb: false,
  UseMinifiedStatics: true,
  DemoMode: false,
  DbDebug: ['error', 'schema', 'warn'] as BaseConnectionOptions['logging'],
  Modules: ['presto'],
  HttpPort: 3000,
  MountPath: '',
};

export const testingDefaults: StaticSettings = {
  ...envSettingsDefaults,
  DbName: 'quixtest',
  DbHost: 'localhost',
  QuixBackendInternalUrl: 'localhost:8081',
  QuixBackendPublicUrl: 'localhost:8081',
  AuthEncKey: '',
  DbType: 'sqlite',
  AuthType: 'fake',
  AutoMigrateDb: true,
  UseMinifiedStatics: false,
  DbDebug: false,
  Modules: ['presto'],
  HttpPort: 3000,
  MountPath: '',
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
const stringListParse = (s: string | undefined) =>
  s !== undefined ? s.split(',') : undefined;

const transforms: {
  [K in keyof StaticSettings]: (
    s: string | undefined,
  ) => StaticSettings[K] | undefined
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
  DemoMode: booleanParse,
  DbDebug: s => {
    if (s === undefined) {
      return undefined;
    }
    if (s === '') {
      return false;
    }
    if (s.toLowerCase() === 'true') {
      return true;
    }
    if (s.toLowerCase() === 'false') {
      return false;
    }
    return s.split(',') as BaseConnectionOptions['logging'];
  },
  Modules: stringListParse,
  HttpPort: numberParse,
  MountPath: identity,
};

const computedSettingsDefaults: ComputedSettings = {
  moduleSettings: {
    presto: {
      syntax: 'ansi_sql',
      engine: 'presto',
    },
  },
};

let env: EnvSettings;

const getComputedSettings = (modules: string[]): ComputedSettings => {
  const computedSettings: ComputedSettings = computedSettingsDefaults;

  modules.forEach(moduleName => {
    const syntaxEnvVar = `MODULE_${moduleName.toUpperCase()}_SYNTAX`;
    const engineEnvVar = `MODULE_${moduleName.toUpperCase()}_ENGINE`;
    const syntax = process.env[syntaxEnvVar] || '';
    const engine = process.env[engineEnvVar] || '';
    computedSettings.moduleSettings[moduleName] = {syntax, engine};
  });
  return computedSettings;
};

export const getEnv = (): EnvSettings => {
  loadEnv();
  if (!env) {
    const staticSettings: StaticSettings = defaults(
      Object.entries(envSettingsMap).reduce(
        (settings, [key, envVar]) => {
          settings[key] = transforms[key as keyof StaticSettings](
            process.env[envVar],
          );
          return settings;
        },
        {} as any,
      ),
      isJestTest() ? testingDefaults : envSettingsDefaults,
    );
    const computedSettings = getComputedSettings(staticSettings.Modules);
    env = {...computedSettings, ...staticSettings};
  }
  return env;
};

type StaticSettings = typeof envSettingsDefaults;
interface ComputedSettings {
  moduleSettings: Record<string, {syntax: string; engine: string}>;
}

export type EnvSettings = StaticSettings & ComputedSettings;
