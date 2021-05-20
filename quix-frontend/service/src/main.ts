import { json } from 'express';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import velocityEngine from './template-engine/velocity';
import cookieParser from 'cookie-parser';
import {createConnection} from 'typeorm';
import {createMysqlConf} from './config/db-connection';
import {getEnv} from './config/env/env';
import {DbMetadata} from './entities/version-metadata.entity';
import {Logger} from '@nestjs/common';
import {
  checkSchemaVersion,
  createInitialSchemaIfNeeded,
  isMasterProcess,
} from './utils/create-schema-helpers';
import {retry} from './utils/retry-promise';
import {WsAdapter} from '@nestjs/platform-ws';

async function bootstrap() {
  const logger = new Logger();
  const env = getEnv();

  if (isMasterProcess()) {
    if (!env.AutoMigrateDb && env.DbType === 'mysql') {
      const conf = createMysqlConf([DbMetadata], env);
      const conn = await retry(() => createConnection(conf))
        .forNTimes(5)
        .andWaitXMilliseconds(2000);

      await createInitialSchemaIfNeeded(conn, env.DbName, logger);
      await checkSchemaVersion(conn, logger);

      await conn.close();
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 3000)); // let master process do it's thing, create schema and all;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.useStaticAssets(env.localStaticsPath);
  app.setBaseViewsDir(env.localStaticsPath);
  app.engine('.vm', velocityEngine());
  app.use(cookieParser());
  app.use(json({limit: '2mb'}));
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(env.HttpPort);
}

bootstrap();
