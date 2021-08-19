interface baseEntity {
  name: string;
  type: string;
}

export interface Column extends baseEntity {
  dataType: string;
}

export interface Table extends baseEntity {
  children: Column[];
}

export interface Schema extends baseEntity {
  children: Table[];
}

export interface Catalog extends baseEntity {
  children: Schema[];
}
export interface IDbConfiguration {
  getColumnList: (tableName: string) => Promise<Column[]>;
  getTableList: (twoPartsSchemaName: string) => Promise<Table[]>;
  getSchemaList: (catalogName: string) => Promise<Schema[]>;
}

export interface IContextEvaluator {
  (input: string, position: number): any;
}

export interface IAutocompleter {
  getCompleters(query: string, position: number): any;
}

export interface IEntities {
  column: Column;
  table: Table;
  schema: Schema;
  catalog: Catalog;
}