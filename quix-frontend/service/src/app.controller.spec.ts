import {Test, TestingModule} from '@nestjs/testing';
import {getConnectionToken} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {ConfigModule} from './config';
import {ValueProvider} from '@nestjs/common/interfaces';

const fakeConnection = {
  provide: getConnectionToken(),
  useValue: {},
};

describe.skip('AppController', () => {
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
  afterEach(() => {
    if (app) {
      app.close();
      app = null;
    }
  });

  describe('index.vm', () => {
    it('should return valid render model', async () => {
      await preTest();
      expect(appController.getIndex()).toMatchObject(
        expect.objectContaining({
          clientTopology: {
            staticsBaseUrl: '/',
          },
        }),
      );
    });

    it('should parse module configuration correctly', async () => {
      const mockedGlobalEnv = {
        MODULES: 'presto,was,athena',

        MODULES_PRESTO_ENGINE: 'presto',
        MODULES_PRESTO_SYNTAX: 'ansi_sql',
        MODULES_PRESTO_API: 'http://presto:8181/v1/',

        MODULES_WAS_ENGINE: 'presto',
        MODULES_WAS_SYNTAX: 'ansi_sql',
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
          syntax: 'ansi_sql',
        }),
      );
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'was',
          engine: 'presto',
          syntax: 'ansi_sql',
        }),
      );
      expect(quixConfig.modules).toContainEqual(
        expect.objectContaining({
          id: 'athena',
          engine: 'athena',
          syntax: 'ansi_sql',
        }),
      );
    });
  });
});
