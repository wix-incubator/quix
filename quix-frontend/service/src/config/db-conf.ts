import {ColumnType, ColumnOptions} from 'typeorm';
import {getEnv} from './utils';
import {QuixEnviorments} from './utils';
import {FileType} from 'shared/entities/file';

/* A comptability layer between MySql and Sqlite (sqljs), should handle everything that typeorm doesn't handle for us */
interface DbColumnConf {
  json: ColumnOptions;
  tinytext: ColumnOptions;
  noteContent: ColumnOptions;
  dateUpdated: ColumnOptions;
  dateCreated: ColumnOptions;
  idColumn: ColumnOptions;
  eventsTimestamp: ColumnOptions;
  fileTypeEnum: ColumnOptions;
  owner: ColumnOptions;
  concat: (s1: string, s2: string) => string;
  fullTextSearch: (columnName: string, textToLookFor: string[]) => string;
}

const MySqlConf: DbColumnConf = {
  json: {type: 'json'},
  tinytext: {type: 'tinytext'},
  noteContent: {type: 'mediumtext', nullable: true},
  dateUpdated: {
    transformer: {from: (d: Date) => d.valueOf(), to: () => undefined},
    readonly: true,
  },
  dateCreated: {
    transformer: {from: (d: Date) => d.valueOf(), to: () => undefined},
    readonly: true,
  },
  eventsTimestamp: {
    type: 'timestamp',
    precision: 4,
    default: () => 'CURRENT_TIMESTAMP(4)',
  },
  idColumn: {nullable: false, unique: true, type: 'varchar', width: 36},
  fileTypeEnum: {
    type: 'enum',
    enum: FileType,
    default: FileType.folder,
  },
  owner: {nullable: false, type: 'varchar', width: 255},
  concat: (s1, s2) => `CONCAT(${s1}, ${s2})`,
  fullTextSearch(columnName, textToLookFor) {
    return `MATCH(${columnName}) AGAINST ('${textToLookFor
      .map(searchText => `"${searchText}"`)
      .join(' ')}' IN BOOLEAN MODE)`;
  },
};

const SqliteConf: DbColumnConf = {
  json: {type: 'simple-json'},
  tinytext: {type: 'varchar', width: 255},
  noteContent: {type: 'text', nullable: true},
  dateUpdated: {
    type: 'integer',
    transformer: {
      from: (d: number) => {
        const date = new Date(d);
        return Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
        ).valueOf();
      },
      to: () => undefined,
    },
  },
  dateCreated: {
    type: 'integer',
    transformer: {
      from: (d: number) => {
        const date = new Date(d);
        return Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
        ).valueOf();
      },
      to: () => undefined,
    },
  },
  eventsTimestamp: {
    type: 'integer',
    default: () => `CAST((julianday('now') - 2440587.5)*86400000 AS INTEGER)`,
    transformer: {
      from: (d: number) => d,
      to: (d?: Date) => d && d.valueOf(),
    },
  },
  idColumn: {nullable: false, unique: true, type: 'varchar', width: 36},
  fileTypeEnum: {type: 'varchar', width: 32, default: FileType.folder},
  owner: {nullable: false, type: 'varchar', width: 255},
  concat: (s1, s2) => `(${s1} || ${s2})`,
  fullTextSearch(columnName, textToLookFor) {
    return textToLookFor
      .map(term => `${columnName} LIKE '%${term}%'`)
      .join(' AND ');
  },
};

export const dbConf = [
  QuixEnviorments.TEST,
  QuixEnviorments.LOCALUSER,
].includes(getEnv())
  ? SqliteConf
  : MySqlConf;
