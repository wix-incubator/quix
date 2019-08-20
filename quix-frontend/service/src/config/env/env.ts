import dotenv from 'dotenv';
import {isJestTest} from '../utils';
import path from 'path';
import {defaults} from 'lodash';
import {BaseConnectionOptions} from 'typeorm/connection/BaseConnectionOptions';
import {StaticSettings, ComputedSettings, EnvSettings} from './types';
import {
  computedSettingsDefaults,
  envSettingsMap,
  testingDefaults,
  envSettingsDefaults,
} from './consts';
import {ModuleEngineType, ModuleEngineToSyntaxMap} from 'shared';

let environmentLoaded = false;
export const loadEnv = () => {
  if (!environmentLoaded) {
    if (isJestTest()) {
      dotenv.config({path: path.resolve(process.cwd(), '.testenv')});
    } else {
      dotenv.config();
    }
    environmentLoaded = true;
  }
};

const identity = <T>(x: T) => x;
const stringParse = (s: string | undefined) => (s === '' ? undefined : s);
const backendUrlParse = (s: string | undefined) => {
  if (s === undefined) {
    return undefined;
  }
  return s.replace('https://', '').replace('http://', '');
};

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
  ) => StaticSettings[K] | undefined;
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
  DbName: stringParse,
  DbUser: stringParse,
  DbPass: identity,
  DbHost: stringParse,
  DbPort: numberParse,
  QuixBackendInternalUrl: backendUrlParse,
  QuixBackendPublicUrl: backendUrlParse,
  GoogleClientId: stringParse,
  GoogleAuthSecret: stringParse,
  AuthCookieName: stringParse,
  AuthEncKey: stringParse,
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

const getModuleSettings = (moduleName: string, globalEnv: any) => {
  const syntaxEnvVar = `MODULES_${moduleName.toUpperCase()}_SYNTAX`;
  const engineEnvVar = `MODULES_${moduleName.toUpperCase()}_ENGINE`;
  let engine = globalEnv[engineEnvVar];
  let syntax: string = '';

  /* backwards compatibility */
  if (engine === undefined) {
    switch (moduleName) {
      case 'presto':
        engine = ModuleEngineType.PRESTO;
        break;
      case 'athena':
        engine = ModuleEngineType.ATHENA;
        break;
      default:
    }
  }

  if (!Object.values(ModuleEngineType).includes(engine)) {
    throw new Error(
      `Bad configuration. Missing or bad 'engine' declaration for module '${moduleName}'. Possible values: ${Object.values(
        ModuleEngineType,
      ).join(',')}`,
    );
  }

  switch (engine) {
    case ModuleEngineType.PRESTO:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.PRESTO];
      break;
    case ModuleEngineType.ATHENA:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.ATHENA];
      break;
    case ModuleEngineType.BIGQUERY:
      syntax = ModuleEngineToSyntaxMap[ModuleEngineType.BIGQUERY];
      break;
    default: {
      syntax = globalEnv[syntaxEnvVar] as string;
    }
  }

  if (!syntax) {
    throw new Error(
      `Bad configuration. Missing 'syntax' declaration for module '${moduleName}'`,
    );
  }
  return {syntax, engine};
};
const getComputedSettings = (
  modules: string[],
  globalEnv: Record<string, string | undefined>,
): ComputedSettings => {
  const computedSettings: ComputedSettings = computedSettingsDefaults;

  modules.forEach(moduleName => {
    computedSettings.moduleSettings[moduleName] = getModuleSettings(
      moduleName,
      globalEnv,
    );
  });
  return computedSettings;
};

export const getEnv = (
  globalEnv: Record<string, string | undefined> = process.env,
): EnvSettings => {
  loadEnv();
  const staticSettings: StaticSettings = defaults(
    Object.entries(envSettingsMap).reduce(
      (settings, [key, envVar]) => {
        settings[key] = transforms[key as keyof StaticSettings](
          globalEnv[envVar],
        );
        return settings;
      },
      {} as any,
    ),
    isJestTest() ? testingDefaults : envSettingsDefaults,
  );
  const computedSettings = getComputedSettings(
    staticSettings.Modules,
    globalEnv,
  );
  const env = {...computedSettings, ...staticSettings};

  return env;
};
