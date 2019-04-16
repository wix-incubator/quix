import {loadEnv} from './env';

export enum QuixEnviorments {
  DEV = 'DEV', // MySql DB, multi user - **** DEFAULT ****
  TEST = 'TEST', // in-mem sql.js(sqlite), single user
  TESTMYSQL = 'TESTMYSQL', // MySql DB, single user
  LOCALUSER = 'LOCALUSER', // in-mem sql.js(sqlite), single user
  PROD = 'PROD', // MySql DB, multi user, doesn't modify db schema automaticlly
}

export function isJestTest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const getEnv = (): QuixEnviorments => {
  loadEnv();
  const env = process.env.QUIX_ENV;
  switch (env) {
    case QuixEnviorments.DEV:
    case QuixEnviorments.LOCALUSER:
    case QuixEnviorments.PROD:
    case QuixEnviorments.TEST:
    case QuixEnviorments.TESTMYSQL:
      return env;
  }

  if (isJestTest()) {
    return QuixEnviorments.TEST;
  }

  return QuixEnviorments.DEV;
};
