import {
  Catalog,
  Column,
  IDbInfoConfig,
  Schema,
  Table,
} from './types';
import axios from 'axios';

export class DbInfoService implements IDbInfoConfig {
  private readonly type: string;
  private readonly apiBasePath: string;
  constructor(type: string, apiBasePath: string) {
    this.type = type;
    this.apiBasePath = apiBasePath;
  }

  public async getColumnsByTable(
    catalog: string,
    schema: string,
    table: string
  ) {
    const url = `${this.apiBasePath}/api/db/${this.type}/explore/${catalog}/${schema}/${table}/`;
    return axios
      .get(url)
      .then((response) => response.data.children)
      .catch((error) => [] as Column[]);
  }

  public async getTablesBySchema(catalog: string, schema: string) {
    return (await axios
      .get(
        `${this.apiBasePath}/api/db/${this.type}/explore/${catalog}/${schema}/`
      )
      .then(({ data }) => data)
      .catch((e) => [])) as Table[];
  }

  public async getSchemasByCatalog(catalog: string) {
    return (await axios
      .get(`${this.apiBasePath}/api/db/${this.type}/explore/${catalog}/`)
      .then(({ data }) => data)
      .catch((e) => [])) as Schema[];
  }

  public async getCatalogs() {
    return (await axios
      .get(`${this.apiBasePath}/api/db/${this.type}/explore/`)
      .then(({ data }) => data)
      .catch((e) => [])) as Catalog[];
  }
}
