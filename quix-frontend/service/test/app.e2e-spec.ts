import {Test, TestingModule} from '@nestjs/testing';
import request from 'supertest';
import {AppModule} from './../src/app.module';
import {INestApplication} from '@nestjs/common';
import {ConfigService} from '../src/config/config.service';
import nock from 'nock';

class E2EConfigService extends ConfigService {}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const configServiceProvider = {
    provide: ConfigService,
    useClass: E2EConfigService,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [configServiceProvider],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    app.close();
  });

  it('should proxy requests to the backend', () => {
    nock('http://backend:8080')
      .get('/api/db/explore')
      .reply(200, []);

    return request(app.getHttpServer())
      .get('/api/db/explore')
      .expect(200);
  });
});
