import { IAutocompleter, IContextEvaluator } from './types';
import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import {
  ContextType,
  QueryContext,
  TableInfo,
  TableType,
} from '../sql-context-evaluator';
import { IDbInfoConfig } from '../db-info';
import { BaseEntity } from '../db-info/types';

export class SqlAutocompleter implements IAutocompleter {
  private config: IDbInfoConfig;
  private readonly contextEvaluator: IContextEvaluator;

  constructor(config: IDbInfoConfig, contextEvaluator: IContextEvaluator) {
    this.config = config;
    this.contextEvaluator = contextEvaluator;
  }

  // setters

  public setConfig(config: IDbInfoConfig) {
    this.config = config;
  }
  public setGetColumns(getColumns: IDbInfoConfig['getColumns']) {
    this.config.getColumns = getColumns;
  }
  public setGetTables(getTabless: IDbInfoConfig['getTables']) {
    this.config.getTables = getTabless;
  }
  public setGetSchema(getSchemas: IDbInfoConfig['getSchemas']) {
    this.config.getSchemas = getSchemas;
  }

  // methods

  /**
   * Evaluate the context from position and suggests autocomplete
   * @param {string} query: a sql query
   * @param {number} position: the offset of the cursor
   * @returns {ICompleterItem[]}
   */
  public async getCompleters(query: string, position: number) {
    return this.getQueryContextInfo(
      this.contextEvaluator(query, position),
      this.getPrefix(query, position)
    );
  }

  /**
   * Extract the columns and tables and their metadata from the queryContext
   * @param {QueryContext} queryContext
   * @return {ICompleterItem[]}
   */
  private async getQueryContextInfo(
    queryContext: QueryContext,
    prefix: string
  ) {
    const { contextType, tables } = queryContext;
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
    for (const { type, name, alias, columns, tableRefs } of tables) {
      switch (type) {
        case TableType.External:
          const tableColumns = await this.config.getColumns(name);
          tableColumns.forEach((column) => {
            completersMemory.add(column.name);
            const completerName: string = alias
              ? `${alias}.${column.name}`
              : name
              ? `${name}.${column.name}`
              : undefined;
            if (completerName) {
              completersMemory.add(completerName);
            }
          });
          break;
        case TableType.Nested:
          for (const tableRef of tableRefs) {
            const tableRefColumns = await this.config.getColumns(tableRef);
            tableRefColumns.forEach((column) => {
              completersMemory.add(column.name);
              const completerName: string = alias
                ? `${alias}.${column.name}`
                : name
                ? `${name}.${column.name}`
                : undefined;
              if (completerName) {
                completersMemory.add(completerName);
              }
            });
          }
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
          break;
        default:
      }
    }

    return Array.from(completersMemory).map((column) =>
      this.createCompleterItem(column, 'column')
    );
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
        ? await this.config.getSchemas(prefix)
        : prefixArray.length === 2
        ? await this.config.getTables(prefix)
        : [];

    return entities.map((entity) =>
      this.createCompleterItem(`${prefix}.${entity.name}`, entity.type)
    );
  }

  private getPrefix(query: string, position: number): string {
    return query
      .slice(0, position)
      .split(/[ ,]+/)
      .pop();
  }
}
