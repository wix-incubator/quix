import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from './../src/app.module';
import {INestApplication} from '@nestjs/common';
import {ConfigService, EnvSettings} from '../src/config';
import nock from 'nock';
import {IGoogleUser} from '../src/modules/auth/types';
import {E2EDriver} from './driver';
import {MockDataBuilder} from './builder';
import cookieParser = require('cookie-parser');
import {sanitizeUserEmail} from 'common/user-sanitizer';

// TODO: run this on mysql, need to reset db between tests
process.env.DB_TYPE = 'sqlite';
let envSettingsOverride: Partial<EnvSettings> = {};

class E2EConfigService extends ConfigService {
  getEnvSettings() {
    const env = super.getEnvSettings();
    return {...env, ...envSettingsOverride};
  }
}

const user1profile: IGoogleUser = {
  email: 'testing@quix.com',
  id: '11',
  name: 'Testing User',
};
const user2profile: IGoogleUser = {
  email: 'secondUser@quix.com',
  id: '22',
  name: 'second User',
};

describe('Application (e2e)', () => {
  let app: INestApplication;
  let driver: E2EDriver;
  let builder: MockDataBuilder;

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
      driver = new E2EDriver(app);
      builder = new MockDataBuilder();
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

    it('should proxy requests to the backend', async () => {
      nock(`http://${fakeBackendHost}`)
        .get('/api/db/explore')
        .reply(200, ['mocked']);

      const returned = await driver.get('db/explore');
      expect(returned).toEqual(['mocked']);
    });
  });

  describe('user list', () => {
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

      expect(users).toMatchObject([
        {
          id: user1profile.email,
          name: user1profile.name,
          rootFolder: expect.any(String),
        },
        {
          id: user2profile.email,
          name: user2profile.name,
          rootFolder: expect.any(String),
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

    it('user list should not contain private information', async () => {
      await driver.doLogin('user1');

      let users = await driver.as('user1').get('users');

      expect(users).toHaveLength(1);

      await driver.doLogin('user2');

      users = await driver.as('user1').get('users');

      expect(users).toMatchObject([
        {
          id: user1profile.email,
          name: user1profile.name,
          rootFolder: expect.any(String),
        },
        {
          id: expect.stringContaining('**'),
          name: expect.stringContaining('**'),
          rootFolder: expect.any(String),
        },
      ]);
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
    });

    it('when searching notebooks,', async () => {
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
    });
  });
});
