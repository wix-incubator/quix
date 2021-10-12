import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { IAutocompleter } from './types';
import {
  ContextType,
  QueryContext,
  TableInfo,
  TableType,
} from '../sql-context-evaluator';
import { IResourcesConfig, IDbInfoConfig, IDwhInfoConfig } from '../db-info';
import { BaseEntity, DwhColumn } from '../db-info/types';

export class SqlAutocompleter implements IAutocompleter {
  private readonly dbConfig: IDbInfoConfig;
  private readonly dwhConfig?: IDwhInfoConfig;

  constructor(config: IResourcesConfig) {
    this.dbConfig = config.dbConfig;
    if (config.dwhConfig) {
      this.dwhConfig = config.dwhConfig;
    }
  }

  // methods

  /**
   * Extract columns and tables from the queryContext
   * @param {QueryContext} queryContext
   * @return {ICompleterItem[]}
   */
  public async getCompletionItemsFromQueryContext(queryContext: QueryContext) {
    const { contextType, tables, prefix } = queryContext;
    switch (contextType) {
      case ContextType.Column:
        return this.getQueryContextColumns(tables);
      case ContextType.Table:
        const tablesCompleters = this.getQueryContextTables(tables);
        const dbEntitiesCompleters = await this.getEntitiesCompletersFromDbBasedOnPrefix(
          prefix
        );
        return [...tablesCompleters, ...dbEntitiesCompleters];
      default:
        return [];
    }
  }

  /**
   * Extract the tables from the queryContext
   * @param {TableInfo[]} tables
   * @return {ICompleterItem[]}
   */
  private getQueryContextTables(tables: TableInfo[]) {
    return tables.map((table) => this.createCompleterItem(table.name, 'table'));
  }

  /**
   * Extract the columns from the queryContext
   * @param {TableInfo[]} tables
   * @return {Promise<ICompleterItem[]>}
   */
  private async getQueryContextColumns(tables: TableInfo[]) {
    const columnsNamesMemory: Set<string> = new Set();
    const columnsWithPrefixMemory: Set<string> = new Set();
    const tablesPromises: Promise<TableInfo>[] = [];

    for (const table of tables) {
      tablesPromises.push(this.extractTableColumns(table));
    }
    const extractedTables = await Promise.all(tablesPromises);

    for (const extractedTable of extractedTables) {
      const { name, alias, columns, type } = extractedTable;
      columns.forEach((column) => {
        const shortColumnName = (name === 'wt_users' || 'wt_metasites') ? column.split('.').pop(): column;
        columnsNamesMemory.add(shortColumnName);

        if (alias) {
          columnsWithPrefixMemory.add(`${alias}.${shortColumnName}`);
        } else if (name && (tables.length > 1 || type === TableType.Nested)) {
          columnsWithPrefixMemory.add(`${name}.${shortColumnName}`);
        }
      });
    }

    return [
      ...columnsNamesMemory,
      ...columnsWithPrefixMemory,
    ].map((completer) => this.createCompleterItem(completer, 'column'));
  }

  /**
   * Extract the columns from the table
   * @param {TableInfo} table
   * @return {Promise<TableInfo>}
   */
  private async extractTableColumns(table: TableInfo) {
    const tablesToExtract = [...table.tableRefs];
    if (table.type === TableType.External) {
      tablesToExtract.push(table.name);
    }

    const columnsByTablesPromises: Promise<BaseEntity[]>[] = [];
    const wtColumnsByTables: string[] = [];
    for (const tableFullName of tablesToExtract) {
      const [catalog, schema, tableName] = tableFullName.split('.');
      if (
        this.dwhConfig &&
        (catalog === 'wt_users' || catalog === 'wt_metasites')
      ) {
        const schemaName = catalog;
        wtColumnsByTables.push(...(await this.getDwhColumnsBySchema(schemaName)));
      } else {
        columnsByTablesPromises.push(
          this.dbConfig.getColumnsByTable(catalog, schema, tableName)
        );
      }

      const columnsByTables = await Promise.all(columnsByTablesPromises);
      for (const columnsByTable of columnsByTables) {
        table.columns.push(...columnsByTable.map((column) => column.name), ...wtColumnsByTables);
      }
    }
    return table;
  }

  private createCompleterItem(value: string, meta: string): ICompleterItem {
    return { value, meta };
  }

  private async getEntitiesCompletersFromDbBasedOnPrefix(prefix: string) {
    const prefixArray = prefix.split('.') || [];
    prefixArray.pop();
    prefix = prefixArray.join('.');

    let entities: BaseEntity[] = [];
    switch (prefixArray.length) {
      case 0:
        entities = await this.dbConfig.getCatalogs();
        break;
      case 1:
        entities = await this.dbConfig.getSchemasByCatalog(prefix);
        break;
      case 2:
        entities = await this.dbConfig.getTablesBySchema(
          prefixArray[0],
          prefixArray[1]
        );
        break;
      default:
        entities = [];
    }

    return entities.map((entity) =>
      this.createCompleterItem(
        entity.type !== 'catalog' ? `${prefix}.${entity.name}` : entity.name,
        entity.type
      )
    );
  }

  private async getDwhColumnsBySchema(schema: string) {
    const tables = (await this.dwhConfig.getTablesBySchema(schema)).map(
      (table) => table.name
    );
    const columnsPromises: Promise<DwhColumn[]>[] = [];
    for (const table of tables) {
      columnsPromises.push(this.dwhConfig.getColumnsByTable(schema, table));
    }
    const allColumnsLists = await Promise.all(columnsPromises);
    const allFlattenColumns: string[] = [];
    for (let i = 0; i < tables.length; i++) {
      allFlattenColumns.push(
        ...allColumnsLists[i].map((column) => {
          column.name = ` ${tables[i]}.${column.name}`;
          return column.name;
        })
      );
    }
    return allFlattenColumns;
  }
}
