import {Test, TestingModule} from '@nestjs/testing';
import {AppController} from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    xit('should return valid render model', () => {
      expect(appController.getIndex()).toEqual({
        clientTopology: {
          staticsBaseUrl: '',
        },
      });
    });
  });
});
