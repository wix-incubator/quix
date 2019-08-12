import {Test, TestingModule} from '@nestjs/testing';
import {getConnectionToken} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {ConfigModule} from './config';
import {ValueProvider} from '@nestjs/common/interfaces';

const fakeConnection = {
  provide: getConnectionToken(),
  useValue: {},
};

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule | null = null;

  async function preTest(mocked?: ValueProvider) {
    const testingModule = Test.createTestingModule({
      controllers: [AppController],
      providers: [fakeConnection],
      imports: [ConfigModule],
    });
    if (mocked) {
      testingModule.overrideProvider(mocked.provide).useValue(mocked.useValue);
    }
    app = await testingModule.compile();

    appController = app.get<AppController>(AppController);
  }
  // beforeEach(async () => preTest());
  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  describe('index.vm', () => {
    it('should return valid render view model', async () => {
      await preTest();
      const vm = appController.getIndex();
      expect(vm).toMatchObject({
        clientTopology: {
          staticsBaseUrl: '/',
        },
      });
    });

    it('should parse module configuration correctly', async () => {
      const mockedGlobalEnv = {
        MODULES: 'presto,was,athena',

        MODULES_PRESTO_ENGINE: 'presto',
        MODULES_PRESTO_API: 'http://presto:8181/v1/',

        MODULES_WAS_ENGINE: 'jdbc',
        MODULES_WAS_SYNTAX: 'someSqlSyntax',
        MODULES_WAS_API: 'http://presto:8181/v1/',

        MODULES_ATHENA_ENGINE: 'athena',
        MODULES_ATHENA_SYNTAX: 'ansi_sql',
        MODULES_ATHENA_DATABASE: 'default',
      };
      await preTest({provide: 'GLOBAL_ENV', useValue: mockedGlobalEnv});
      const quixConfig = JSON.parse(appController.getIndex().quixConfig);
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'presto',
          engine: 'presto',
          syntax: 'presto',
        }),
      );
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'was',
          engine: 'jdbc',
          syntax: 'someSqlSyntax',
        }),
      );
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'athena',
          engine: 'athena',
          syntax: 'athena',
        }),
      );
    });

    it('should parse old style configuration correctly', async () => {
      const mockedGlobalEnv = {
        MODULES: 'presto,athena',
      };
      await preTest({provide: 'GLOBAL_ENV', useValue: mockedGlobalEnv});
      const quixConfig = JSON.parse(appController.getIndex().quixConfig);
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'presto',
          engine: 'presto',
          syntax: 'presto',
        }),
      );
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'athena',
          engine: 'athena',
          syntax: 'athena',
        }),
      );
    });
  });
});
