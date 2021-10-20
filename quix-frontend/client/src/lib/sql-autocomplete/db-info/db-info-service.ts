import { Catalog, Column, IDbInfoConfig, Schema, Table } from './types';
import axios from 'axios';

export class DbInfoService implements IDbInfoConfig {
  private readonly type: string;
  private readonly apiBasePath: string;

  private catalogs: Catalog[] = [];
  private readonly tables: { [key: string]: Column[] } = {};

  constructor(type: string, apiBasePath: string) {
    this.type = type;
    this.apiBasePath = apiBasePath;
  }

  getCatalogs = async (): Promise<Catalog[]> => {
    if (!this.catalogs.length) {
      const response = await axios.get(
        `${this.apiBasePath}/api/db/${this.type}/explore`
      );

      this.catalogs = response.data;
    }

    return this.catalogs;
  };

  getSchemasByCatalog = async (catalog: string): Promise<Schema[]> => {
    const catalogs: Catalog[] = await this.getCatalogs();
    const catalogData: Catalog | undefined = catalogs.find(
      (currCatalog) => currCatalog.name === catalog
    );
    return catalogData?.children || [];
  };

  getTablesBySchema = async (
    catalog: string,
    schema: string
  ): Promise<Table[]> => {
    const catalogSchemas: Schema[] = await this.getSchemasByCatalog(catalog);
    const schemaData: Schema | undefined = catalogSchemas.find(
      (catalogSchema) => catalogSchema.name === schema
    );
    return schemaData?.children || [];
  };

  getColumnsByTable = async (
    catalog: string,
    schema: string,
    table: string
  ): Promise<Column[]> => {
    const query = `${encodeURIComponent(catalog)}/${encodeURIComponent(
      schema
    )}/${encodeURIComponent(table)}`;

    if (this.tables[query]) {
      return this.tables[query];
    }

    const response = await axios.get(
      `${this.apiBasePath}/api/db/${this.type}/explore/${query}`
    );

    const tableData: Table = response.data;
    this.tables[query] = (tableData?.children || []).map((column) => ({
      ...column,
    }));

    return this.tables[query];
  };

  search = async (type: string, prefix: string): Promise<Catalog[]> => {
    return axios
      .get(`${this.apiBasePath}/api/db/${type}/search`, { params: { q: prefix } })
      .then((response) => response.data);
  };
}
