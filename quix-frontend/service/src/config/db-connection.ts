import {ConnectionOptions} from 'typeorm';
import {EnvSettings} from './env';
import {isJestTest, isTsNode} from './utils';

type ClassConstructor = new (...args: any[]) => any;

export const createInMemConf = (
  entities: ClassConstructor[] | string[],
  settings: EnvSettings,
): ConnectionOptions => {
  return {
    type: 'sqljs',
    synchronize: settings.AutoMigrateDb,
    entities,
    logger: 'advanced-console',
    logging: settings.DbDebug,
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
    logging: settings.DbDebug,
    migrations: isTsNode()
      ? ['./src/migrations/*.ts']
      : ['./dist/migrations/*.js'],
  };
};
