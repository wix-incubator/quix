import cluster from 'cluster';
import {QUIX_SCHEMA, CURRENT_QUIX_SCHEMA_VERSION} from '../consts';
import {Connection} from 'typeorm';
import {DbMetadata} from 'entities/version-metadata.entity';
import {Logger} from '@nestjs/common';

export async function checkSchemaVersion(conn: Connection, logger: Logger) {
  const result = await conn
    .getRepository(DbMetadata)
    .findOne({name: QUIX_SCHEMA})
    .catch(e => {
      logger.error(e);
      return undefined;
    });
  if (!result || result.version !== CURRENT_QUIX_SCHEMA_VERSION) {
    logger.error(
      `Can't run Quix. DB schema version doesn't match. Please check how to upgrade the schema at https://wix.github.io/quix/docs/installation#upgrading-quix`,
    );
    process.exit(-1);
  }
}

export async function createIntialSchmeaIfNeeded(
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

export function retry<R>(what: () => Promise<R>) {
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

function isPm2() {
  return (
    'PM2_HOME' in process.env ||
    'PM2_JSON_PROCESSING' in process.env ||
    'PM2_CLI' in process.env
  );
}

export function isMasterProcess() {
  if (isPm2()) {
    return process.env.pm_id === '0';
  } else {
    return cluster.isMaster;
  }
}
