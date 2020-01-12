import {Inject, Injectable} from '@nestjs/common';
import {ConnectionOptions} from 'typeorm';
import * as dbConnection from './db-connection';
import {EnvSettings, loadEnv, getEnv} from './env';
import {ClientConfigHelper, ModuleComponentType} from 'shared';

export type DbTypes = 'mysql' | 'sqlite';

loadEnv();

export abstract class ConfigService {
  private env: EnvSettings;

  constructor(@Inject('GLOBAL_ENV') globalEnv: any) {
    this.env = getEnv(globalEnv);
    /* tslint:disable-next-line */
    console.log(`****** Current Environment:: DbType:${this.env.DbType}/AuthType:${this.env.AuthType} ******`);
  }

  getEnvSettings(): EnvSettings {
    return this.env;
  }

  getDbType(): DbTypes {
    const env = this.getEnvSettings();
    return env.DbType;
  }

  getDbConnection(entities: any[]): ConnectionOptions {
    switch (this.env.DbType) {
      case 'sqlite':
        return dbConnection.createInMemConf(entities, this.getEnvSettings());
      case 'mysql': {
        return dbConnection.createMysqlConf(entities, this.getEnvSettings());
      }
    }
  }

  async getClientConfig() {
    const env = this.getEnvSettings();
    const clientConfig = new ClientConfigHelper();
    const staticsBaseUrl = env.remoteStaticsPath
      ? env.remoteStaticsPath
      : `${env.MountPath}/`;

    clientConfig
      .setAuth({
        googleClientId: env.GoogleClientId,
        authCookieName: env.AuthCookieName,
      })
      .setClientTopology({
        executeBaseUrl: env.QuixBackendPublicUrl,
        staticsBaseUrl,
        apiBasePath: env.MountPath,
      })
      .setMode({
        debug: env.UseMinifiedStatics,
        demo: env.DemoMode,
      });

    env.Modules.forEach(m =>
      clientConfig.addModule({
        id: m,
        name: m,
        components: env.moduleSettings[m].components,
        engine: env.moduleSettings[m].engine as any,
        syntax: env.moduleSettings[m].syntax,
      }),
    );

    return clientConfig;
  }
}

@Injectable()
export class DefaultConfigService extends ConfigService {}
