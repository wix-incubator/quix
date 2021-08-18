import { ICompleterItem } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from '../sql-autocomplete-adapter';
import {
  Column,
  IContextEvaluator,
  IDbConfiguration,
  Schema,
  Table,
} from '../types';

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

export const testDbConfig: IDbConfiguration = {
  getColumnList: getColumnList,
  getTableList: getTableList,
  getSchemaList: getSchemaList,
};

export const createCompleterItem = (name: string, meta: string) => {
  const item: ICompleterItem = {
    value: name,
    meta: meta,
  };
  return item;
};
