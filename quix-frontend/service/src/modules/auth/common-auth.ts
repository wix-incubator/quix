import {IGoogleUser} from './types';
import {getEnv} from '../../config/env';
import {verify} from 'jsonwebtoken';
import {isJestTest} from 'config/utils';

const defaultUser: IGoogleUser = {
  email: 'user@quix.com',
  id: '1',
  name: 'Default User',
};

export const fakeAuth = (token: string): IGoogleUser => {
  try {
    const user = JSON.parse(Buffer.from(token, 'base64').toString());

    return user;
  } catch (e) {
    if (isJestTest()) {
      throw new Error('no user');
    }
    // tslint:disable-next-line: no-console
    console.debug(`Can't parse cookie, using default user.`);
    return defaultUser;
  }
};

const jwtAuth = (token: string): IGoogleUser => {
  const key = getEnv().AuthEncKey;
  const user = verify(token, key);
  return user as IGoogleUser;
};

export const auth = getEnv().AuthType === 'fake' ? fakeAuth : jwtAuth;
