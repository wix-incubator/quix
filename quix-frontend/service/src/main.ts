import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import path from 'path';
import velocityEngine from './template-engine/velocity';
import cookieParser from 'cookie-parser';
import {createConnection} from 'typeorm';
import {createMysqlConf} from 'config/db-connection';
import {getEnv} from 'config/env';
import {DbMetadata} from 'entities/version-metadata.entity';
import {Logger} from '@nestjs/common';
import {
  checkSchemaVersion,
  createIntialSchmeaIfNeeded,
  isMasterProcess,
} from './utils/create-schema-helpers';
import {retry} from './utils/retry-promise';

async function bootstrap() {
  const logger = new Logger();
  const env = getEnv();

  if (isMasterProcess()) {
    if (!env.AutoMigrateDb && env.DbType === 'mysql') {
      const conf = createMysqlConf([DbMetadata], env);
      const conn = await retry(() => createConnection(conf))
        .forNtimes(5)
        .andWaitXmilliseconds(2000);

      await createIntialSchmeaIfNeeded(conn, env.DbName, logger);
      await checkSchemaVersion(conn, logger);

      await conn.close();
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 3000)); // let master process do it's thing, create schema and all;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(path.resolve(__dirname, '..', 'statics'));
  app.setBaseViewsDir(path.resolve(__dirname, '..', 'statics'));
  app.engine('.vm', velocityEngine());
  app.use(cookieParser());
  await app.listen(env.HttpPort);
}
bootstrap();
