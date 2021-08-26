import { BaseEntity, Catalog, Column, IDbInfoConfig, Schema, Table } from './types';
import axios from 'axios';

export class DbInfoService implements IDbInfoConfig {
  private readonly type: string;
  private readonly apiBasePath: string;
  constructor(type: string, apiBasePath: string) {
    this.type = type;
    this.apiBasePath = apiBasePath;
  }

  public async getColumns(tableName: string) {
    const [catalog, schema, table] = tableName.split('.');
    const url = `${this.apiBasePath}/api/db/${this.type}/explore/${catalog}/${schema}/${table}/`;
    return axios
      .get(url)
      .then((response) => response.data.children)
      .catch((error) => [] as Column[]);
  }

  public async getTables(schemaName: string) {
    const [catalog, schema] = schemaName.split('.');
    return (await axios
      .get(
        `${this.apiBasePath}/api/db/${this.type}/explore/${catalog}/${schema}/`
      )
      .then(({ data }) => data)
      .catch((e) => [])) as Table[];
  }

  public async getSchemas(catalogName: string) {
    return (await axios
      .get(`${this.apiBasePath}/api/db/${this.type}/explore/${catalogName}/`)
      .then(({ data }) => data)
      .catch((e) => [])) as Schema[];
  }

  public async getCatalogs() {
    return (await axios
      .get(`${this.apiBasePath}/api/db/${this.type}/explore/`)
      .then(({ data }) => data)
      .catch((e) => [])) as Catalog[];
  }

  public async getData(entityName: string) {
    const path: string[] = entityName.split('.');
    return (await axios
      .get(`${this.apiBasePath}/api/db/${this.type}/explore/${path.join('/')}/`)
      .then(({ data }) => data)
      .catch((e) => [])) as BaseEntity[];
  }
}
