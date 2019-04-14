import {loadEnv} from './env';

export enum QuixEnviorments {
  DEV = 'DEV',
  TEST = 'TEST',
  TESTMYSQL = 'TESTMYSQL',
  LOCALUSER = 'LOCALUSER',
  PROD = 'PROD',
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

  return QuixEnviorments.LOCALUSER;
};
