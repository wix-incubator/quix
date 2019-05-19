import {Test, TestingModule} from '@nestjs/testing';
import request from 'supertest';
import {AppModule} from './../src/app.module';
import {INestApplication} from '@nestjs/common';
import {ConfigService, EnvSettings} from '../src/config';
import nock from 'nock';
import {UserProfile} from '../src/modules/auth/types';

// TODO: run this on mysql, need to reset db between tests
process.env.DB_TYPE = 'sqlite';
let envSettingsOverride: Partial<EnvSettings> = {};

class E2EConfigService extends ConfigService {
  getEnvSettings() {
    const env = super.getEnvSettings();
    return {...env, ...envSettingsOverride};
  }
}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const beforeAndAfter = () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ConfigService)
        .useClass(E2EConfigService)
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterEach(() => {
      envSettingsOverride = {};
      return app.close();
    });
  };

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('backend proxy', () => {
    const fakeBackendHost = 'backend:8081';
    beforeEach(() => {
      envSettingsOverride.QuixBackendInternalUrl = fakeBackendHost;
    });
    beforeAndAfter();

    it('should proxy requests to the backend', () => {
      nock(`http://${fakeBackendHost}`)
        .get('/api/db/explore')
        .reply(200, []);

      return request(app.getHttpServer())
        .get('/api/db/explore')
        .expect(200);
    });
  });

  fdescribe('users table', () => {
    const up: UserProfile = {
      email: 'testing@quix.com',
      id: '11',
      name: 'Testing User',
    };
    const up2: UserProfile = {
      email: 'secondUser@quix.com',
      id: '22',
      name: 'second User',
    };
    beforeAndAfter();

    it('should add a user on first login', async () => {
      await request(app.getHttpServer())
        .get(`/api/authenticate?code=${encodeURIComponent(JSON.stringify(up))}`)
        .expect(200);

      let users = (await request(app.getHttpServer())
        .get(`/api/users`)
        .expect(200)).body;

      expect(users).toHaveLength(1);

      await request(app.getHttpServer())
        .get(
          `/api/authenticate?code=${encodeURIComponent(JSON.stringify(up2))}`,
        )
        .expect(200);

      users = (await request(app.getHttpServer())
        .get(`/api/users`)
        .expect(200)).body;

      expect(users).toMatchObject([
        {id: up.email, name: up.name, rootFolder: expect.any(String)},
        {id: up2.email, name: up2.name, rootFolder: expect.any(String)},
      ]);
    });
  });
});
