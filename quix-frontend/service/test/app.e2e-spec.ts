/* tslint:disable:no-non-null-assertion */
import 'reflect-metadata';
import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from './../src/app.module';
import {INestApplication, Logger} from '@nestjs/common';
import {ConfigService, EnvSettings} from '../src/config';
import nock from 'nock';
import {IGoogleUser} from '../src/modules/auth/types';
import {E2EDriver} from './driver';
import {E2EMockDataBuilder} from './builder';
import cookieParser = require('cookie-parser');
import {sanitizeUserEmail} from 'common/user-sanitizer';
import {getConnectionToken} from '@nestjs/typeorm';
import {Connection} from 'typeorm';
import './custom-matchers';

let envSettingsOverride: Partial<EnvSettings> = {};

class E2EConfigService extends ConfigService {
  getEnvSettings(): EnvSettings {
    const env = super.getEnvSettings();
    return {...env, AutoMigrateDb: false, ...envSettingsOverride};
  }
}

const user1profile: IGoogleUser = {
  email: 'testing@quix.com',
  id: '111111111',
  name: 'Testing User',
};
const user2profile: IGoogleUser = {
  email: 'secondUser@quix.com',
  id: '222222222',
  name: 'second User',
  avatar: 'http://seconduseravatar.png',
};

describe('Application (e2e)', () => {
  let app: INestApplication;
  let driver: E2EDriver;
  let builder: E2EMockDataBuilder;

  const beforeAndAfter = () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ConfigService)
        .useClass(E2EConfigService)
        .compile();

      app = moduleFixture.createNestApplication();
      app.use(cookieParser());
      await app.init();

      const configService: ConfigService = moduleFixture.get(ConfigService);
      const conn: Connection = moduleFixture.get(getConnectionToken());
      if (configService.getDbType() === 'mysql') {
        await conn.dropDatabase();
        await conn.runMigrations();
      } else {
        await conn.synchronize();
      }

      driver = new E2EDriver(app);
      builder = new E2EMockDataBuilder();
    });

    afterEach(async () => {
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

    it('should proxy requests to the backend', async () => {
      nock(`http://${fakeBackendHost}`)
        .get('/api/db/explore')
        .reply(200, ['mocked']);

      const returned = await driver.get('db/explore');
      expect(returned).toEqual(['mocked']);
    });
  });

  describe('User list', () => {
    beforeAndAfter();

    beforeEach(() => {
      driver.addUser('user1', user1profile).addUser('user2', user2profile);
    });

    it('should add a user on first login', async () => {
      await driver.doLogin('user1');

      let users = await driver.as('user1').get('users');

      expect(users).toHaveLength(1);
      await driver.doLogin('user2');

      users = await driver.as('user1').get('users');
      expect(users).toMatchArrayAnyOrder([
        {
          id: user1profile.email,
          name: user1profile.name,
          rootFolder: expect.any(String),
          dateCreated: expect.any(Number),
          dateUpdated: expect.any(Number),
        },
        {
          id: user2profile.email,
          name: user2profile.name,
          rootFolder: expect.any(String),
          dateCreated: expect.any(Number),
          dateUpdated: expect.any(Number),
        },
      ]);
      expect(users[0].dateCreated - Date.now()).toBeLessThan(2000); // Within 2 seconds
    });

    it('should update details on login', async () => {
      await driver.doLogin('user1');

      driver.addUser('user1', {...user1profile, name: 'new name'});

      await driver.doLogin('user1');

      const users = await driver.as('user1').get('users');
      expect(users).toMatchArrayAnyOrder([
        {
          id: user1profile.email,
          name: 'new name',
          rootFolder: expect.any(String),
          dateCreated: expect.any(Number),
          dateUpdated: expect.any(Number),
        },
      ]);
    });
  });

  describe('Demo Mode', () => {
    beforeEach(() => {
      envSettingsOverride.DemoMode = true;
    });
    beforeAndAfter();
    beforeEach(() => {
      driver.addUser('user1', user1profile).addUser('user2', user2profile);
    });

    const expectObject = (json: object) => ({
      toNotLeakUserData(user: IGoogleUser) {
        expect(JSON.stringify(json)).toEqual(
          expect.not.stringContaining(user2profile.email),
        );
        expect(JSON.stringify(json)).toEqual(
          expect.not.stringContaining(user2profile.name!),
        );
        expect(JSON.stringify(json)).toEqual(
          expect.not.stringContaining(user2profile.id!),
        );
        expect(JSON.stringify(json)).toEqual(
          expect.not.stringContaining(user2profile.avatar!),
        );
      },
    });

    it('user list should not contain private information', async () => {
      await driver.doLogin('user1');

      let users = await driver.as('user1').get('users');
      expect(users).toHaveLength(1);

      await driver.doLogin('user2');
      users = await driver.as('user1').get('users');

      expect(users).toMatchArrayAnyOrder([
        {
          id: user1profile.email,
          name: user1profile.name,
          rootFolder: expect.any(String),
        },
        {
          id: expect.stringContaining('**'),
          name: 'Quix User',
          rootFolder: expect.any(String),
        },
      ]);
      expectObject(users).toNotLeakUserData(user2profile);
    });

    it('when fetching other user notebook, user name should be hidden', async () => {
      await driver.doLogin('user1');

      const [{id: rootFolder}] = await driver.as('user1').get('files');
      const [notebookId, createAction] = builder.createNotebookAction([
        {id: rootFolder},
      ]);

      await driver.as('user1').postEvents(createAction);

      let notebookFromServer = await driver
        .as('user1')
        .get('notebook', notebookId);

      expect(notebookFromServer.owner).toBe(user1profile.email);

      notebookFromServer = await driver.as('user2').get('notebook', notebookId);

      expect(notebookFromServer.owner).toBe(
        sanitizeUserEmail(user1profile.email),
      );
      expectObject(notebookFromServer).toNotLeakUserData(user1profile);
    });

    it('when searching notebooks, sanitize user', async () => {
      await driver.doLogin('user1');

      const [{id: rootFolder}] = await driver.as('user1').get('files');
      const [notebookId, createAction] = builder.createNotebookAction([
        {id: rootFolder},
      ]);

      await driver.as('user1').postEvents([
        createAction,
        builder.createNoteAction(notebookId, {
          content: 'some query goes here',
        }),
      ]);

      let searchResults = await driver
        .as('user1')
        .search('"some query goes here"');
      expect(searchResults.notes[0].owner).toBe(user1profile.email);

      searchResults = await driver.as('user2').search('"some query goes here"');
      expect(searchResults.notes[0].owner).toBe(
        sanitizeUserEmail(user1profile.email),
      );
      expectObject(searchResults).toNotLeakUserData(user1profile);
    });
  });
});

function resolveIn(n: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, n));
}
