import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import path from 'path';
import velocityEngine from './template-engine/velocity';
import cookieParser from 'cookie-parser';
import {createConnection, getMetadataArgsStorage, Connection} from 'typeorm';
import {createMysqlConf} from 'config/db-connection';
import {getEnv} from 'config/env';
import {DbMetadata} from 'entities/version-metadata.entity';
import {QUIX_SCHEMA, CURRENT_QUIX_SCHEMA_VERSION} from './consts';
import {Logger} from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const env = getEnv();

  if (!env.AutoMigrateDb && env.DbType === 'mysql') {
    const conf = createMysqlConf([DbMetadata], env);
    const conn = await retry(() => createConnection(conf))
      .forNtimes(5)
      .andWaitXmilliseconds(2000);

    await createIntialSchmeaIfNeeded(conn, env.DbName, logger);
    await checkSchemaVersion(conn, logger);

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

async function checkSchemaVersion(conn: Connection, logger: Logger) {
  const result = await conn
    .getRepository(DbMetadata)
    .findOne({name: QUIX_SCHEMA})
    .catch(e => {
      logger.error(e);
      return undefined;
    });
  if (!result || result.version !== CURRENT_QUIX_SCHEMA_VERSION) {
    logger.error(`Can't run Quix. DB schema version doesn't match `);
    process.exit(-1);
  }
}

async function createIntialSchmeaIfNeeded(
  conn: Connection,
  dbName: string,
  logger: Logger,
) {
  try {
    const versionMetadataTableName = conn.getMetadata(DbMetadata).tableName;
    const [{cnt: doesTableExist}] = await conn.query(`SELECT count(*) as cnt
    FROM information_schema.TABLES
    WHERE (TABLE_SCHEMA = '${dbName}') AND (TABLE_NAME = '${versionMetadataTableName}')`);

    if (doesTableExist === '0') {
      logger.log(
        'Looks like this is your first time running quix, setting up initial schema',
      );
      await conn.runMigrations();
    }
  } catch (e) {
    logger.error('failed creating initial schema');
    logger.error(e);
    process.exit(-1);
  }
}

function retry<R>(what: () => Promise<R>) {
  return {
    forNtimes: (n: number) => ({
      andWaitXmilliseconds: async (milliseconds: number) => {
        let counter = 0;
        let error: Error | null = null;
        let result: R = {} as any;
        while (counter < n) {
          await what()
            .then(r => {
              result = r;
              error = null;
            })
            .catch(e => {
              error = e;
              return undefined;
            });
          if (error) {
            counter++;
            await new Promise(resolve => setTimeout(resolve, milliseconds));
          } else {
            return result;
          }
        }
        throw error;
      },
    }),
  };
}
