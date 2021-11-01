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

export interface CacheProps {
  catalogs: Catalog[];
  tables: { [key: string]: Column[] };
}

export interface IDbInfoConfig {
  getColumnsByTable(
    catalog: string,
    schema: string,
    table: string,
    type?: string
  ): Promise<Column[]>;
  getTablesBySchema(
    catalog: string,
    schema: string,
    type?: string
  ): Promise<Table[]>;
  getSchemasByCatalog(catalog: string, type?: string): Promise<Schema[]>;
  getCatalogs(type?: string): Promise<Catalog[]>;
  search(prefix: string, type?: string): Promise<Catalog[]>;
  preFetch(type?: string): any;
}
