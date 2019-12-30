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

  fdescribe('Syhchronize sessions', () => {
    beforeAndAfter();

    beforeEach(() => {
      driver.addUser('user1', user1profile).addUser('user2', user2profile);
    });

    describe('/api/events/latest', () => {
      it('Should provide latest event id for single event', async () => {
        await driver.doLogin('user1');

        const [{id: rootFolder}] = await driver.as('user1').get('files');
        const [notebookId, createAction] = builder.createNotebookAction([
          {id: rootFolder},
        ]);

        await driver.as('user1').postEvents(createAction);

        const {latestEventId} = await driver
          .as('user1')
          .get('events', 'latest');
        expect(latestEventId).toBe(notebookId);
      });

      it('Should provide latest event id for multiple events', async () => {
        await driver.doLogin('user1');

        const [{id: rootFolder}] = await driver.as('user1').get('files');
        const [
          firstNotebookId,
          firstCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          secondNotebookId,
          secondCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);

        await driver
          .as('user1')
          .postEvents([firstCreateAction, secondCreateAction]);

        const {latestEventId} = await driver
          .as('user1')
          .get('events', 'latest');
        expect(latestEventId).toBe(secondNotebookId);
      });

      it('Should provide latest event id for single event, according to user ID', async () => {
        await driver.doLogin('user1');

        const [{id: user1RootFolder}] = await driver.as('user1').get('files');
        const [
          user1NotebookId,
          user1CreateAction,
        ] = builder.createNotebookAction([{id: user1RootFolder}]);

        await driver.doLogin('user2');

        const [{id: user2RootFolder}] = await driver.as('user2').get('files');
        const [
          user2NotebookId,
          user2CreateAction,
        ] = builder.createNotebookAction([{id: user2RootFolder}]);

        await driver.as('user1').postEvents(user1CreateAction);
        await driver.as('user2').postEvents(user2CreateAction);

        const {latestEventId: user1LatestEventId} = await driver
          .as('user1')
          .get('events', 'latest');
        expect(user1LatestEventId).toBe(user1NotebookId);

        const {latestEventId: user2LatestEventId} = await driver
          .as('user2')
          .get('events', 'latest');
        expect(user2LatestEventId).toBe(user2NotebookId);
      });
    });

    describe('/api/events/:id', () => {
      it('Should provide all events after given event ID', async () => {
        await driver.doLogin('user1');

        const [{id: rootFolder}] = await driver.as('user1').get('files');
        const [
          firstNotebookId,
          firstCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          secondNotebookId,
          secondCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          thirdNotebookId,
          thirdCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);

        await driver
          .as('user1')
          .postEvents([
            firstCreateAction,
            secondCreateAction,
            thirdCreateAction,
          ]);

        const events = await driver.as('user1').get('events', firstNotebookId);

        expect(events).toEqual([
          {...secondCreateAction, user: expect.any(String)},
          {...thirdCreateAction, user: expect.any(String)},
        ]);
      });

      it('Should provide all events after given event ID, posted individually', async () => {
        await driver.doLogin('user1');

        const [{id: rootFolder}] = await driver.as('user1').get('files');
        const [
          firstNotebookId,
          firstCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          secondNotebookId,
          secondCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          thirdNotebookId,
          thirdCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);

        await driver.as('user1').postEvents(firstCreateAction);
        await driver.as('user1').postEvents(secondCreateAction);
        await driver.as('user1').postEvents(thirdCreateAction);

        const events = await driver.as('user1').get('events', firstNotebookId);

        expect(events).toEqual([
          {...secondCreateAction, user: expect.any(String)},
          {...thirdCreateAction, user: expect.any(String)},
        ]);
      });

      it('Should provide all events after given event ID, given more than one user', async () => {
        await driver.doLogin('user1');
        const [{id: rootFolder}] = await driver.as('user1').get('files');

        const [
          firstNotebookId,
          firstCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          secondNotebookId,
          secondCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);
        const [
          thirdNotebookId,
          thirdCreateAction,
        ] = builder.createNotebookAction([{id: rootFolder}]);

        await driver.doLogin('user2');
        const [{id: user2RootFolder}] = await driver.as('user2').get('files');

        await driver.as('user1').postEvents(firstCreateAction);
        await driver.as('user1').postEvents(secondCreateAction);
        await driver.as('user1').postEvents(thirdCreateAction);

        const [
          user2FirstNotebookId,
          user2FirstCreateAction,
        ] = builder.createNotebookAction([{id: user2RootFolder}]);
        const [
          user2SecondNotebookId,
          user2SecondCreateAction,
        ] = builder.createNotebookAction([{id: user2RootFolder}]);
        await driver.as('user2').postEvents(user2FirstCreateAction);
        await driver.as('user2').postEvents(user2SecondCreateAction);

        const events = await driver.as('user1').get('events', firstNotebookId);
        const user2Events = await driver
          .as('user2')
          .get('events', user2FirstNotebookId);
        expect(events).toEqual([
          {...secondCreateAction, user: expect.any(String)},
          {...thirdCreateAction, user: expect.any(String)},
        ]);
        expect(user2Events).toEqual([
          {...user2SecondCreateAction, user: expect.any(String)},
        ]);
      });
    });
  });
});

function resolveIn(n: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, n));
}
