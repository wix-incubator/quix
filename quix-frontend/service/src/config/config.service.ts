import {Injectable} from '@nestjs/common';
import {ConnectionOptions} from 'typeorm';
import * as dbConnection from './db-connection';
import {EnvSettings, loadEnv, getEnv} from './env';

export type DbTypes = 'mysql' | 'sqlite';

loadEnv();

export abstract class ConfigService {
  private env: EnvSettings;
  constructor() {
    this.env = getEnv();
    /* tslint:disable-next-line */
    console.log(`****** Current Enviorment:: DbType:${this.env.DbType}/AuthType:${this.env.AuthType} ******`);
  }

  getEnvSettings(): EnvSettings {
    return this.env;
  }

  getDbType(): DbTypes {
    const env = this.getEnvSettings();
    return env.DbType;
  }

  getDbConnection(entites: any[]): ConnectionOptions {
    switch (this.env.DbType) {
      case 'sqlite':
        return dbConnection.createInMemConf(entites, this.env);
      case 'mysql': {
        return dbConnection.createMysqlConf(entites, this.env);
      }
    }
  }
}

@Injectable()
export class DefaultConfigService extends ConfigService {}
