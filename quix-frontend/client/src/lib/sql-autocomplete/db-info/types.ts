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
  getColumnsByTable(catalog: string,schema: string,table: string): Promise<Column[]>;
  getTablesBySchema(catalog: string,schema: string): Promise<Table[]>;
  getSchemasByCatalog(catalog: string): Promise<Schema[]>;
  getCatalogs(): Promise<Catalog[]>;
}
