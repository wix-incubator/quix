import { IAutocompleter, IContextEvaluator } from './types';
import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { ContextType, QueryContext, TableInfo } from '../sql-context-evaluator';
import { IDbInfoConfig } from '../db-info';

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
    return this.getQueryContextInfo(this.contextEvaluator(query, position));
  }

  /**
   * Extract the columns and tables and their metadata from the queryContext
   * @param {QueryContext} queryContext
   * @return {ICompleterItem[]}
   */
  private async getQueryContextInfo(queryContext: QueryContext) {
    const { contextType, tables } = queryContext;
    switch (contextType) {
      case ContextType.Column:
        return this.getQueryContextColumns(tables);
      case ContextType.Table:
        return this.getQueryContextTables(tables);
      default:
    }
  }

  /**
   * Extract the tables from the queryContext
   * @param {TableInfo[]} tables
   * @return {ICompleterItem[]}
   */
  private getQueryContextTables(tables: TableInfo[]) {
    const completers: ICompleterItem[] = [];
    const completersMem: Set<string> = new Set();
    const completionItem: ICompleterItem = { value: '', meta: 'table' };
    tables.forEach((table) => {
      if (!completersMem.has(table.name)) {
        completersMem.add(table.name);
        completionItem.value = table.name;
        completers.push({ ...completionItem });
      }
    });
    return completers;
  }

  /**
   * Extract the columns from the queryContext
   * @param {TableInfo[]} tables
   * @return {ICompleterItem[]}
   */
  private async getQueryContextColumns(tables: TableInfo[]) {
    const completersMemory: Set<string> = new Set();
    for (const { name, alias, columns, tableRefs } of tables) {
      for (const tableRef of tableRefs) {
        const tableRefcolumns = await this.config.getColumns(tableRef);
        tableRefcolumns.forEach((column) => {
          columns.push(column.name);
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
    }
    return Array.from(completersMemory).map((column) => {
      const completer: ICompleterItem = {value: column, meta: 'column'}
      return completer;
    });
  }
}
