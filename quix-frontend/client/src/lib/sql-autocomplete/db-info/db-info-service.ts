import {
  CacheProps,
  Catalog,
  Column,
  IDbInfoConfig,
  Schema,
  Table,
} from './types';
import axios from 'axios';

export class DbInfoService implements IDbInfoConfig {
  private readonly cache = new Map<string, CacheProps>();

  constructor(
    private readonly type: string,
    private readonly apiBasePath: string
  ) {}

  preFetch = async (type: string = this.type) => {
    this.addCacheTypeEntry(type);
    if (!this.cache.get(type).catalogs) {
      const response = await axios.get(
        `${this.apiBasePath}/api/db/${type}/explore`
      );
      this.cache.set(type, response.data);
    }
  };

  getCatalogs = async (type: string = this.type): Promise<Catalog[]> => {
    await this.preFetch(type);
    return this.cache[type];
  };

  getSchemasByCatalog = async (
    catalog: string,
    type?: string
  ): Promise<Schema[]> => {
    const catalogs: Catalog[] = await this.getCatalogs(type);
    const catalogData: Catalog | undefined = catalogs.find(
      (currCatalog) => currCatalog.name === catalog
    );
    return catalogData?.children || [];
  };

  getTablesBySchema = async (
    catalog: string,
    schema: string,
    type?: string
  ): Promise<Table[]> => {
    const catalogSchemas: Schema[] = await this.getSchemasByCatalog(
      catalog,
      type
    );
    const schemaData: Schema | undefined = catalogSchemas.find(
      (catalogSchema) => catalogSchema.name === schema
    );
    return schemaData?.children || [];
  };

  getColumnsByTable = async (
    catalog: string,
    schema: string,
    table: string,
    type: string = this.type
  ): Promise<Column[]> => {
    const query = `${encodeURIComponent(catalog)}/${encodeURIComponent(
      schema
    )}/${encodeURIComponent(table)}`;

    this.addCacheTypeEntry(type);

    if (this.cache.get(type).tables[query]) {
      return this.cache.get(type).tables[query];
    }

    const response = await axios.get(
      `${this.apiBasePath}/api/db/${type}/explore/${query}`
    );

    const tableData: Table = response.data;
    this.cache.get(type).tables[query] = (tableData?.children || []).map(
      (column) => ({
        ...column,
      })
    );

    return this.cache.get(type).tables[query];
  };

  search = async (
    prefix: string,
    type: string = this.type
  ): Promise<Catalog[]> => {
    return axios
      .get(`${this.apiBasePath}/api/db/${type}/search`, {
        params: { q: prefix },
      })
      .then((response) => response.data);
  };

  private readonly addCacheTypeEntry = (type: string) => {
    if (!this.cache.has(type)) {
      const newCacheProp: CacheProps = { catalogs: [], tables: {} };
      this.cache.set(type, newCacheProp);
    }
  };
}
