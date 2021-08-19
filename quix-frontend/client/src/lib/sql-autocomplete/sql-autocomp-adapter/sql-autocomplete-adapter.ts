import {
  Column,
  IAutocompleter,
  IContextEvaluator,
  IDbConfiguration,
  Schema,
  Table,
} from './types';
import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { ContextType, QueryContext, TableInfo } from '../sql-context-evaluator';

export class SqlAutocompleter implements IAutocompleter {
  private config: IDbConfiguration;
  private contextEvaluator: IContextEvaluator;

  constructor(config: IDbConfiguration, contextEvaluator: IContextEvaluator) {
    this.config = config;
    this.contextEvaluator = contextEvaluator;
  }

  public setConfig(config: IDbConfiguration) {
    this.config = config;
  }
  public setGetColumns(getColumnList: IDbConfiguration['getColumnList']) {
    this.config.getColumnList = getColumnList;
  }
  public setGetTables(getTablesList: IDbConfiguration['getTableList']) {
    this.config.getTableList = getTablesList;
  }
  public setGetSchema(getSchemaList: IDbConfiguration['getSchemaList']) {
    this.config.getSchemaList = getSchemaList;
  }

  public getCompleters(query: string, position: number) {
    const queryContext = this.contextEvaluator(query, position);
    const completers = this.getQueryContextInfo(queryContext);
    return completers;
  }

  private getQueryContextColumns(
    tables: TableInfo[],
    completers: Set<ICompleterItem>
  ) {
    tables.forEach((table) => {
      const { name, alias, columns, tableRefs } = table;
      tableRefs.forEach(async (tableRef) => {
        const tableRefcolumns = await this.config.getColumnList(tableRef);
        tableRefcolumns.forEach((column) => {
          columns.push(column.name);
        });
      });
      let completionItem: ICompleterItem = { value: '', meta: 'column' };
      columns.forEach((column) => {
        completionItem.value = column;
        completers.add({ ...completionItem });
        const completerName: string = alias
          ? `${alias}.${column}`
          : name
          ? `${name}.${column}`
          : undefined;
        if (completerName) {
          completionItem.value = completerName;
          completers.add({ ...completionItem });
        }
      });
    });
  }

  private getQueryContextTables(
    tables: TableInfo[],
    completers: Set<ICompleterItem>
  ) {
    let completionItem: ICompleterItem = { value: '', meta: 'table' };
    tables.forEach((table) => {
      completionItem.value = table.name;
      completers.add({ ...completionItem });
    });
  }

  private getQueryContextInfo(queryContext: QueryContext) {
    /**
     * Extract the columns and tables and thier metadata from the queryContext
     * @param {QueryContext} queryContext
     * @return {ICompleterItem[]}
     */
    const { contextType, tables } = queryContext;
    const completers = new Set<ICompleterItem>();
    switch (contextType) {
      case ContextType.Column:
        this.getQueryContextColumns(tables, completers);
        break;
      case 'Table':
        this.getQueryContextTables(tables, completers);
        break;
    }
    return [...completers];
  }
}
