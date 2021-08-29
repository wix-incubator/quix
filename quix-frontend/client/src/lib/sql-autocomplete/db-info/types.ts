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

export interface IDbInfoConfig {
  getColumns(tableName: string): Promise<Column[]>;
  getTables(schemaName: string): Promise<Table[]>;
  getSchemas(catalogName: string): Promise<Schema[]>;
  getCatalogs(): Promise<Catalog[]>;
  getData?(path:string): Promise<BaseEntity[]>
}
