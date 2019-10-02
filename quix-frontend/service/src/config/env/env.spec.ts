import {getEnv} from './env';
import {testingDefaults} from './static-settings';

describe('configuration parsing', () => {
  it('should override empty strings with defaults', () => {
    const mockEnv = {
      DB_HOST: '',
      DB_USER: '',
    };
    const env = getEnv();
    expect(env.DbHost).toBe(testingDefaults.DbHost);
    expect(env.DbUser).toBe(testingDefaults.DbUser);
  });
});
