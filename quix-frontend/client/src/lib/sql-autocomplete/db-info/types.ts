export interface BaseEntity {
  name: string;
  type: string;
}

export interface Column extends BaseEntity {
  dataType: string;
}

export interface Table extends BaseEntity {
  children: Column[];
}

export interface Schema extends BaseEntity {
  children: Table[];
}

export interface Catalog extends BaseEntity {
  children: Schema[];
}

export type DataTypeHttp =
  | 'timestamp'
  | 'date'
  | 'varchar'
  | 'bigint'
  | 'smallint'
  | 'integer'
  | 'float'
  | 'double'
  | 'decimal'
  | 'boolean'
  | 'array(varchar)';

export type DataType =
  | 'datetime'
  | 'string'
  | 'numeric'
  | 'bool'
  | 'array(string)';

export interface DwhTreeHttp {
  tree: DwhSchemaHttp[];
}

export interface DwhSchemaHttp {
  shortName: string;
  description: string;
  comments: string;
  tables: DwhTableHttp[];
  dateCreated: number;
  dateUpdated: number;
}

export interface DwhTableHttp {
  shortName: string;
  description: string;
  comments: string;
  columns: DwhColumnHttp[];
  dateCreated: number;
  dateUpdated: number;
}

export interface DwhColumnHttp {
  shortName: string;
  description: string;
  comments: string;
  dataType: DataTypeHttp;
  dateCreated: number;
  dateUpdated: number;
}

export interface DwhSchema {
  name: string;
  description: string;
  comments: string;
  dateCreated: number;
  dateUpdated: number;
}

export interface DwhTable {
  name: string;
  description: string;
  comments: string;
  dateCreated: number;
  dateUpdated: number;
}

export interface DwhColumn extends BaseEntity {
  dataType: DataTypeHttp;
  normalizedDataType: DataType;
  description: string;
  comments: string;
  dateCreated: number;
  dateUpdated: number;
}

export interface IDbInfoConfig {
  getColumnsByTable(catalog: string,schema: string,table: string): Promise<Column[]>;
  getTablesBySchema(catalog: string,schema: string): Promise<Table[]>;
  getSchemasByCatalog(catalog: string): Promise<Schema[]>;
  getCatalogs(): Promise<Catalog[]>;
  search(type: string, prefix: string): Promise<Catalog[]>;
}

export interface IDwhInfoConfig {
  getColumnsByTable(schema: string,table: string): Promise<DwhColumn[]>;
  getTablesBySchema(schema: string): Promise<DwhTable[]>;
}

export interface IResourcesConfig {
  dbConfig: IDbInfoConfig;
  dwhConfig?: IDwhInfoConfig;
}
