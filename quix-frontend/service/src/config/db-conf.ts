import {ColumnOptions, PrimaryColumnOptions} from 'typeorm';
import {getEnv} from './env/env';
import {FileType} from '@wix/quix-shared/entities/file';
import {ContentSearch, SearchTextType} from '@wix/quix-shared';
import {escape} from 'mysql2';
import {EntityType} from '../common/entity-type.enum';

/* A compatibility layer between MySql and Sqlite (sqljs), should handle everything that typeorm doesn't handle for us */
interface DbColumnConf {
  json: ColumnOptions;
  shortTextField: ColumnOptions;
  nameField: ColumnOptions;
  noteContent: ColumnOptions;
  dateUpdated: ColumnOptions;
  dateCreated: ColumnOptions;
  dateDeleted: ColumnOptions;
  idColumn: PrimaryColumnOptions;
  eventsTimestamp: ColumnOptions;
  fileTypeEnum: ColumnOptions;
  entityTypeEnum: ColumnOptions;
  userAvatar: ColumnOptions;
  concat: (s1: string, s2: string) => string;
  fullTextSearch: (
    columnName: string,
    textToLookFor: ContentSearch[],
  ) => string;
}

const MySqlConf: DbColumnConf = {
  json: {type: 'json', nullable: true},
  shortTextField: {type: 'varchar', length: 64},
  nameField: {type: 'varchar', length: 512},
  noteContent: {type: 'mediumtext', nullable: true},
  dateUpdated: {
    transformer: {
      from: (d?: Date) => d && d.valueOf(),
      to: (v?: number) => (v !== undefined ? new Date(v) : undefined),
    },
    readonly: true,
    name: 'date_updated',
  },
  dateCreated: {
    transformer: {
      from: (d?: Date) => d && d.valueOf(),
      to: (v?: number) => (v !== undefined ? new Date(v) : undefined),
    },
    readonly: true,
    name: 'date_created',
  },
  dateDeleted: {
    transformer: {
      from: (d?: Date) => d && d.valueOf(),
      to: (v?: number) => (v !== undefined ? new Date(v) : undefined),
    },
    readonly: true,
    name: 'date_deleted',
  },
  eventsTimestamp: {
    type: 'timestamp',
    precision: 4,
    default: () => 'CURRENT_TIMESTAMP(4)',
  },
  idColumn: {nullable: false, unique: true, type: 'varchar', length: 36},
  fileTypeEnum: {
    type: 'enum',
    enum: FileType,
    default: FileType.folder,
  },
  entityTypeEnum: {
    type: 'enum',
    enum: EntityType,
    default: EntityType.Notebook,
  },
  userAvatar: {nullable: true, type: 'varchar', length: 255},
  concat: (s1, s2) => `CONCAT(${s1}, ${s2})`,
  fullTextSearch(columnName, contentSearchList) {
    return `MATCH(${columnName}) AGAINST (${escape(
      contentSearchList
        .map(contentSearch =>
          contentSearch.type === SearchTextType.PHRASE
            ? `"${contentSearch.text}"`
            : `${contentSearch.text}*`,
        )
        .join(' '),
    )} IN BOOLEAN MODE)`;
  },
};

const SqliteConf: DbColumnConf = {
  json: {type: 'simple-json', nullable: true},
  shortTextField: {type: 'varchar', length: 64},
  nameField: {type: 'varchar', length: 512},
  noteContent: {type: 'text', nullable: true},
  dateUpdated: {
    type: 'integer',
    name: 'date_updated',
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
      to: (v?: number) => v,
    },
  },
  dateCreated: {
    type: 'integer',
    name: 'date_created',
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
      to: (v?: number) => v,
    },
  },
  dateDeleted: {
    type: 'integer',
    name: 'date_deleted',
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
      to: (v?: number) => v,
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
  idColumn: {nullable: false, unique: true, type: 'varchar', length: 36},
  fileTypeEnum: {type: 'varchar', length: 32, default: FileType.folder},
  entityTypeEnum: {type: 'integer', default: EntityType.Notebook},
  userAvatar: {nullable: true, type: 'varchar', length: 255},
  concat: (s1, s2) => `(${s1} || ${s2})`,
  fullTextSearch(columnName, contentSearchList) {
    return contentSearchList
      .map(searchItem => `${columnName} LIKE '%${searchItem.text}%'`)
      .join(' OR ');
  },
};
export const dbConf = getEnv().DbType === 'mysql' ? MySqlConf : SqliteConf;
