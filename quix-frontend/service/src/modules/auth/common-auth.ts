import {IExternalUser} from './types';
import {isJestTest} from '../../config/utils';

const defaultUser: IExternalUser = {
  email: 'user@quix.com',
  id: '1',
  name: 'Default User',
};

export const fakeAuth = (token: string): IExternalUser | undefined => {
  try {
    const user = JSON.parse(Buffer.from(token, 'base64').toString());

    return user;
  } catch (e) {
    if (isJestTest()) {
      return undefined;
    }
    // tslint:disable-next-line: no-console
    console.debug(`Can't parse cookie, using default user.`);
    return defaultUser;
  }
};
