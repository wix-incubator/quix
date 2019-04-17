import {ColumnType, ColumnOptions} from 'typeorm';
import {getEnv} from './utils';
import {QuixEnviorments} from './utils';
import {FileType} from '../../../shared/entities/file';

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
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    transformer: {from: (d: Date) => d.valueOf(), to: () => undefined},
  },
  dateCreated: {
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    transformer: {from: (d: Date) => d.valueOf(), to: () => undefined},
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
    default: () => `strftime('%s', 'now')`,
    transformer: {
      from: (d: number) => d,
      to: () => Date.now() /* on update not supported by sqlite */,
    },
  },
  dateCreated: {
    type: 'integer',
    default: () => `strftime('%s', 'now')`,
    transformer: {
      from: (d: number) => d,
      to: () => undefined,
    },
  },
  eventsTimestamp: {
    type: 'integer',
    default: () => `strftime('%s', 'now')`,
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
