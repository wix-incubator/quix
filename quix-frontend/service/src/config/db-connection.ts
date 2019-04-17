import {ConnectionOptions} from 'typeorm';
import {EnvSettings} from './config.service';

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

export const createLocalMysqlConf = (
  entities: ClassConstructor[] | string[],
  settings: EnvSettings,
): ConnectionOptions => {
  return {
    type: 'mysql',
    host: settings.DbHost,
    port: parseInt(settings.DbPort, 10),
    username: settings.DbUser,
    password: settings.DbPass,
    database: settings.DbName,
    synchronize: true,
    entities,
    logger: 'advanced-console',
    // logging: true,
  };
};

export const createProdMysqlConf = (
  entities: ClassConstructor[] | string[],
  settings: EnvSettings,
): ConnectionOptions => {
  return {
    type: 'mysql',
    host: settings.DbHost,
    port: parseInt(settings.DbPort, 10),
    username: settings.DbUser,
    password: settings.DbPass,
    database: settings.DbName,
    synchronize: false,
    entities,
  };
};

// const dbConnectionProvider = {
//   provide: 'CONNECTION',
//   useValue: connection,
// };
