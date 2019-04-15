import {Injectable, Logger, Inject} from '@nestjs/common';
import {getEnv, QuixEnviorments} from './utils';
import {ConnectionOptions} from 'typeorm';
import * as dbConnection from './db-connection';
export type DbTypes = 'mysql' | 'sqlite';
import {defaults} from 'lodash';
import {loadEnv} from './env';

loadEnv();

export abstract class ConfigService {
  constructor() {
    const env = this.getEnv();
    /* tslint:disable-next-line */
    console.log(`****** Current Enviorment: ${env} ******`);
  }

  getEnv(): QuixEnviorments {
    return getEnv();
  }

  getEnvSettings(): EnvSettings {
    return defaults(
      Object.entries(envSettingsMap).reduce(
        (settings, [key, envVar]) => {
          settings[key] = process.env[envVar];
          return settings;
        },
        {} as any,
      ),
      envSettingsDefaults,
    );
  }

  getDbType(): DbTypes {
    const env = this.getEnv();
    switch (env) {
      case QuixEnviorments.TEST:
      case QuixEnviorments.LOCALUSER:
        return 'sqlite';
      case QuixEnviorments.PROD:
      case QuixEnviorments.DEV:
      case QuixEnviorments.TESTMYSQL:
        return 'mysql';
    }
  }

  getDbConnection(entites: any[]): ConnectionOptions {
    const db = this.getDbType();
    const settings = this.getEnvSettings();
    switch (db) {
      case 'sqlite':
        return dbConnection.createInMemConf(entites);
      case 'mysql': {
        const env = this.getEnv();
        return env === QuixEnviorments.PROD
          ? dbConnection.createProdMysqlConf(entites, settings)
          : dbConnection.createLocalMysqlConf(entites, settings);
      }
    }
  }
}

@Injectable()
export class DefaultConfigService extends ConfigService {}

export type EnvSettings = {[K in keyof typeof envSettingsMap]: string};

const envSettingsMap = {
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
};

const envSettingsDefaults: EnvSettings = {
  DbName: 'Quix',
  DbUser: 'root',
  DbPass: '',
  DbHost: 'db',
  DbPort: '3306',
  QuixBackendInternalUrl: 'backend:8080',
  QuixBackendPublicUrl: 'localhost:8080',
  GoogleClientId: '',
  GoogleAuthSecret: '',
  AuthCookieName: '',
  AuthEncKey: '',
};
