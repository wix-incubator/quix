import {ColumnType, ColumnOptions} from 'typeorm';
import {getEnv} from './utils';
import {QuixEnviorments} from './utils';
import {FileType} from '../../../shared/entities/file';
import {text} from 'body-parser';

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
}

const MySqlConf: DbColumnConf = {
  json: {type: 'json'},
  tinytext: {type: 'tinytext'},
  noteContent: {type: 'mediumtext'},
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
};

const SqliteConf: DbColumnConf = {
  json: {type: 'simple-json'},
  tinytext: {type: 'varchar', width: 255},
  noteContent: {type: 'text'},
  dateUpdated: {
    type: 'numeric',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  },
  dateCreated: {
    type: 'numeric',
    default: () => 'CURRENT_TIMESTAMP',
  },
  eventsTimestamp: {
    type: 'numeric',
    default: () => 'CURRENT_TIMESTAMP',
    transformer: {
      from: (d: number) => new Date(d),
      to: (d?: Date) => d && d.valueOf(),
    },
  },
  idColumn: {nullable: false, unique: true, type: 'varchar', width: 36},
  fileTypeEnum: {type: 'varchar', width: 32, default: FileType.folder},
  owner: {nullable: false, type: 'varchar', width: 255},
  concat: (s1, s2) => `(${s1} || ${s2})`,
};

export const dbConf = [
  QuixEnviorments.TEST,
  QuixEnviorments.LOCALUSER,
].includes(getEnv())
  ? SqliteConf
  : MySqlConf;
