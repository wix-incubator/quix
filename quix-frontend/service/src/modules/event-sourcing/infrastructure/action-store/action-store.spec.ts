import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import 'reflect-metadata';
import {Repository} from 'typeorm';
import * as uuid from 'uuid';
import {ConfigService, ConfigModule} from '../../../../config';
import {DbActionStore} from './action-store';
import {DbAction} from './entities/db-action.entity';
import {IActionStore} from './types';

describe('action store', () => {
  let actionStore: IActionStore;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.create(),
        TypeOrmModule.forRootAsync({
          imports: [],
          useFactory: async (configService: ConfigService) =>
            configService.getDbConnection([DbAction]),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([DbAction]),
      ],
      providers: [DbActionStore],
      exports: [DbActionStore],
    }).compile();

    actionStore = module.get(DbActionStore);
    await module
      .get<Repository<DbAction>>(getRepositoryToken(DbAction))
      .clear();
  });

  afterEach(() => {
    module.close();
  });

  it('should store and retrieve the action correctly', async () => {
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
