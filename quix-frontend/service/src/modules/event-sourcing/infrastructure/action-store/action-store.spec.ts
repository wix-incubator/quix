import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import 'reflect-metadata';
import {Repository} from 'typeorm';
import * as uuid from 'uuid';
import {ConfigModule} from '../../../../config/config.module';
import {ConfigService} from '../../../../config/injection-symbols';
import {DbActionStore} from './action-store';
import {MySqlAction} from './entities/mysql-action';
import {IActionStore} from './types';

describe('sqlite store', () => {
  let actionStore: IActionStore;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) =>
            configService.getDbConnection([MySqlAction]),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([MySqlAction]),
      ],
      providers: [DbActionStore],
      exports: [DbActionStore],
    }).compile();

    actionStore = module.get(DbActionStore);
    await module
      .get<Repository<MySqlAction>>(getRepositoryToken(MySqlAction))
      .clear();
  });

  afterEach(() => {
    module.close();
  });

  it('should store and retreive the action correctly', async () => {
    const id = uuid.v4();
    const base = {
      id,
      user: 'foo@wix.com',
      type: 'bla.bla',
      isDeleted: false,
    };
    await actionStore.pushAction(base);
    const fromDb = await actionStore.get(id);
    expect(fromDb).toHaveLength(1);
    const {dateCreated, ...rest} = fromDb[0];
    expect(rest).toEqual(base);
  });
});
