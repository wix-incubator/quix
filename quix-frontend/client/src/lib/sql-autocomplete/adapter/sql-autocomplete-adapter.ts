import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { IAutocompleter } from './types';
import {
  ContextType,
  QueryContext,
  TableInfo,
  TableType,
} from '../sql-context-evaluator';
import { IDbInfoConfig } from '../db-info';
import { BaseEntity } from '../db-info/types';

export class SqlAutocompleter implements IAutocompleter {
  private readonly config: IDbInfoConfig;

  constructor(config: IDbInfoConfig) {
    this.config = config;
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
    return [...new Set(tables.map((table) => table.name))].map((completer) =>
      this.createCompleterItem(completer, 'table')
    );
  }

  /**
   * Extract the columns from the queryContext
   * @param {TableInfo[]} tables
   * @return {ICompleterItem[]}
   */
  private async getQueryContextColumns(tables: TableInfo[]) {
    const completersMemory: Set<string> = new Set();
    for (const table of tables) {
      const { name, alias, columns } = table;
      await this.extractTableColumns(table);
      columns.forEach((column) => {
        completersMemory.add(column);
        const completerName: string = alias
          ? `${alias}.${column}`
          : name
          ? `${name}.${column}`
          : undefined;
        if (completerName) {
          completersMemory.add(completerName);
        }
      });
    }
    return [...completersMemory].map((completer) =>
      this.createCompleterItem(completer, 'column')
    );
  }

  /**
   * Extract the columns from the table
   * @param {TableInfo} table
   * @return {void}
   */
  private async extractTableColumns(table: TableInfo) {
    const { type, name, tableRefs, columns } = table;
    if (type === TableType.External) {
      tableRefs.push(name);
    }
    for (const tableRef of tableRefs) {
      const tableRefNameParts = tableRef.split('.');
      const tableRefColumns = await this.config.getColumnsByTable(
        tableRefNameParts[0],
        tableRefNameParts[1],
        tableRefNameParts[2]
      );
      columns.push(...tableRefColumns.map((column) => column.name));
    }
  }

  private createCompleterItem(value: string, meta: string): ICompleterItem {
    return { value, meta };
  }

  private async getEntitiesCompletersFromDbBasedOnPrefix(prefix: string) {
    const prefixArray = prefix.split('.') || [];
    prefixArray.pop();
    prefix = prefixArray.join('.');

    const entities: BaseEntity[] =
      prefixArray.length === 0
        ? await this.config.getCatalogs()
        : prefixArray.length === 1
        ? await this.config.getSchemasByCatalog(prefix)
        : prefixArray.length === 2
        ? await this.config.getTablesBySchema(prefixArray[0], prefixArray[1])
        : [];

    return entities.map((entity) =>
      this.createCompleterItem(
        entity.type !== 'catalog' ? `${prefix}.${entity.name}` : entity.name,
        entity.type
      )
    );
  }
}
