import {ConnectionOptions} from 'typeorm';
import {EnvSettings} from './env';

type ClassConstructor = new (...args: any[]) => any;

export const createInMemConf = (
  entities: ClassConstructor[] | string[],
): ConnectionOptions => {
  return {
    type: 'sqljs',
    synchronize: true,
    entities,
    logger: 'advanced-console',
    // logging: true,
    // autoSave: true,
    // location: './sqlite.db',
  };
};

export const createMysqlConf = (
  entities: ClassConstructor[] | string[],
  settings: EnvSettings,
): ConnectionOptions => {
  return {
    type: 'mysql',
    host: settings.DbHost,
    port: settings.DbPort,
    username: settings.DbUser,
    password: settings.DbPass,
    database: settings.DbName,
    synchronize: settings.AutoMigrateDb,
    entities,
    logger: 'advanced-console',
    // logging: true,
  };
};

// const dbConnectionProvider = {
//   provide: 'CONNECTION',
//   useValue: connection,
// };
