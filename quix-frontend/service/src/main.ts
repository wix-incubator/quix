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
import {QUIX_SCHEMA, CURRENT_QUIX_SCHEMA_VERSION} from './consts';

async function bootstrap() {
  const env = getEnv();
  if (!env.AutoMigrateDb && env.DbType === 'mysql') {
    const conf = createMysqlConf([DbMetadata], env);
    const conn = await createConnection(conf);
    const result = await conn
      .getRepository(DbMetadata)
      .findOne({name: QUIX_SCHEMA});
    if (!result || result.version !== CURRENT_QUIX_SCHEMA_VERSION) {
      console.error(`Can't run Quix. DB schema version doesn't match `);
      process.exit(-1);
    }
    await conn.close();
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(path.resolve(__dirname, '..', 'statics'));
  app.setBaseViewsDir(path.resolve(__dirname, '..', 'statics'));
  app.engine('.vm', velocityEngine());
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
