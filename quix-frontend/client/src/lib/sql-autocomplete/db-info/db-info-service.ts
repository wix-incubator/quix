import { IDbInfoConfig, Schema, Table } from './types';
import axios from 'axios';
// import * as Resources from '../../../services/resources';

export class DbInfoService implements IDbInfoConfig {
  private readonly type: string;
  private readonly apiBasePath: string;
  constructor(type: string, apiBasePath: string) {
    this.type = type;
    this.apiBasePath = apiBasePath;
  }

  public async getColumns(tableName: string) {
    const path: string[] = tableName.split('.');
    if (path.length === 3) {
      return (await axios
        .get(
          `${this.apiBasePath}/api/db/${this.type}/explore/${path.join('/')}/`
        )
        .then(({ data }) => (data as Table).children)
        .catch((e) => [])) as any;
    }
    return Promise.resolve([]);
  }

  public async getTables(schemaName: string) {
    const path: string[] = schemaName.split('.');
    if (path.length === 2) {
      return (await axios
        .get(
          `${this.apiBasePath}/api/db/${this.type}/explore/${path.join('/')}/`
        )
        .then(({ data }) => (data as Schema).children)
        .catch((e) => [])) as any;
    }
    return Promise.resolve([]);
  }

  public async getSchemas(catalogName: string) {
    const path: string[] = catalogName.split('.');
    if (path.length === 1) {
      return (await axios
        .get(
          `${this.apiBasePath}/api/db/${this.type}/explore/${path.join('/')}/`
        )
        .then(({ data }) => (data as Schema).children)
        .catch((e) => [])) as any;
    }
    return Promise.resolve([]);
  }

  public async getData(path: string) {
    return (await axios
      .get(
        `${this.apiBasePath}/api/db/${this.type}/explore/${path.replace(
          '.',
          '/'
        )}/`
      )
      .then(({ data }) => (data as Table).children)
      .catch((e) => [])) as any;
  }
}
