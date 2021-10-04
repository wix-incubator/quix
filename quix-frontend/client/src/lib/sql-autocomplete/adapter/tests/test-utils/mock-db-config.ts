import {
  Catalog,
  Column,
  IDbInfoConfig,
  Schema,
  Table,
} from '../../../db-info/types';

export class MockDbInfoService implements IDbInfoConfig {
  public async getColumnsByTable(
    catalog: string,
    schema: string,
    table: string
  ) {
    return [
      this.createColumn(`col1_of_${table}`),
      this.createColumn(`col2_of_${table}`),
    ];
  }

  public async getTablesBySchema(catalog: string, schema: string) {
    return [
      this.createTable(`tbl1_of_${schema}`),
      this.createTable(`tbl2_of_${schema}`),
    ];
  }

  public async getSchemasByCatalog(catalog: string) {
    return [
      this.createSchema(`schm1_of_${catalog}`),
      this.createSchema(`schm2_of_${catalog}`),
    ];
  }

  public async getCatalogs() {
    return [this.createCatalog('catalog1')];
  }

  public async search(type: string, prefix: string) {
    return [];
  }

  private createColumn = (name: string): Column => {
    return { name: name, type: 'column', dataType: 'varchar' } as Column;
  };

  private createTable = (name: string): Table => {
    return {
      name: name,
      type: 'table',
      children: [this.createColumn('col1'), this.createColumn('col2')],
    };
  };

  private createSchema = (name: string): Schema => {
    return {
      name: name,
      type: 'schema',
      children: [this.createTable('tbl1'), this.createTable('tbl2')],
    };
  };

  private createCatalog = (name: string): Catalog => {
    return {
      name: name,
      type: 'catalog',
      children: [this.createSchema('schm1')],
    };
  };
}
