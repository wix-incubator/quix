import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';
import {
  Column,
  IDbInfoConfig,
  Schema,
  Table,
} from '../../db-info/';
import {IContextEvaluator} from '../types';

// export interface IDbConfiguration {
//   getColumnList: (threePartsTableName: string) => Promise<Column[]>;
//   getTableList: (twoPartsSchemaName: string) => Promise<Table[]>;
//   getSchemaList: (catalogName: string) => Promise<Schema[]>;
// }

export const getColumnList = async (
  threePartsTableName: string
): Promise<Column[]> => {
  const columns = [
    createTestColumn('col1'),
    createTestColumn('col2'),
    createTestColumn('col3'),
  ];
  return columns;
};

// export const getColumnListFromTable = async (
//   table: string
// ): Promise<Column[]> => {
//   const columns = table.children;
//   return columns;
// };

export const getTableList = async (
  twoPartsSchemaName: string
): Promise<Table[]> => {
  const tbl = await createTestTable('tbl1');
  const tables = [tbl];
  return tables;
};

export const getSchemaList = async (catalogName: string): Promise<Schema[]> => {
  const schm = await createTestSchema('schm1');
  const schema = [schm];
  return schema;
};

export const createTestColumn = (name: string): Column => {
  const col: Column = { name: name, type: 'column', dataType: 'column' };
  return col;
};

export const createTestTable = async (name: string): Promise<Table> => {
  const children = await getColumnList(name);
  const tbl: Table = { name: name, type: 'table', children: children };
  return tbl;
};

export const createTestSchema = async (name: string): Promise<Schema> => {
  const tbl: Schema = {
    name: name,
    type: 'Schema',
    children: await getTableList(name),
  };
  return tbl;
};

export const createCompleterItem = (name: string, meta: string) => {
  const item: ICompleterItem = {
    value: name,
    meta: meta,
  };
  return item;
};

export const testDbConfig: IDbInfoConfig = {
  getColumns: getColumnList,
  getTables: getTableList,
  getSchemas: getSchemaList,
};

export const testTable: Table = {
  name: '',
  type: 'table',
  children: [
    createTestColumn('col1'),
    createTestColumn('col2'),
    createTestColumn('col3'),
  ],
};
