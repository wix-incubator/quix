import {Injectable} from '@nestjs/common';
import {ConnectionOptions} from 'typeorm';
import * as dbConnection from './db-connection';
import {EnvSettings, loadEnv, getEnv} from './env';
import {ClientConfigHelper, ConfigComponent} from 'shared';
import axios, {AxiosResponse} from 'axios';
import {retry} from '../utils/retry-promise';
import {ConfigModule} from './config.module';

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

  async getClientConfig() {
    const env = this.getEnvSettings();
    const clientConfig = new ClientConfigHelper();
    clientConfig
      .setAuth({googleClientId: env.GoogleClientId})
      .setOptions({demoMode: env.DemoMode})
      .setClientTopology({
        quixBackendUrl: env.QuixBackendPublicUrl,
        staticsBaseUrl: '',
        debug: env.UseMinifiedStatics,
      });
    env.Modules.forEach(m =>
      clientConfig.addModule({
        id: m,
        name: m,
        componenets: [ConfigComponent.note],
      }),
    );

    const modulesSupportingDbTree = await retry(() =>
      axios.get(`${env.QuixBackendInternalUrl}/api/db/config`),
    )
      .forNtimes(5)
      .andWaitXmilliseconds(1000)
      .then(r => r.data as string[])
      .catch(e => ['presto']);

    modulesSupportingDbTree.forEach(m =>
      clientConfig.addComponentToModule(m, ConfigComponent.dbExplorer),
    );

    return clientConfig;
  }
}

@Injectable()
export class DefaultConfigService extends ConfigService {}
