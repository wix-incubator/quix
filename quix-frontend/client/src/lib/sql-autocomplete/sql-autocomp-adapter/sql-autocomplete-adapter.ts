import {
  Column,
  IAutocompleter,
  IContextEvaluator,
  IDbConfiguration,
  Schema,
  Table,
} from './types';
import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { getQueryContextColumns, getQueryContextTables } from './utils';
import { ContextType, QueryContext } from '../sql-context-evaluator';

export class SqlAutocompleter implements IAutocompleter {
  private config: IDbConfiguration;
  private contextEvaluator: IContextEvaluator;

  constructor(config: IDbConfiguration, contextEvaluator: IContextEvaluator) {
    this.config = config;
    this.contextEvaluator = contextEvaluator;
  }

  public setConfig(
    config?: IDbConfiguration,
    getColumnList?: (threePartsTableName: string) => Promise<Column[]>,
    getTableList?: (twoPartsSchemaName: string) => Promise<Table[]>,
    getSchemaList?: (catalogName: string) => Promise<Schema[]>
  ) {
    this.config = config? config : this.config; 
    this.config.getColumnList = getColumnList? getColumnList : this.config.getColumnList;
    this.config.getTableList = getTableList? getTableList : this.config.getTableList;
    this.config.getSchemaList = getSchemaList? getSchemaList : this.config.getSchemaList;
  };

  public getCompleters(query: string, position: number) {
    const queryContext = this.contextEvaluator(query, position);
    const completers = this.getQueryContextInfo(queryContext);
    return completers;
  }

  private getQueryContextInfo(queryContext: QueryContext) {
    /**
     * Extract the columns and tables and thier metadata from the queryContext
     * @param {QueryContext} queryContext
     * @return {Ic[]}
     */
    const { contextType, tables } = queryContext;
    const completers = new Set<ICompleterItem>();
    let completionItem: ICompleterItem;
    switch (contextType) {
      case ContextType.Column:
        completionItem.meta = 'column';
        getQueryContextColumns(
          tables,
          completionItem,
          completers,
          this.config.getColumnList
        );
        break;
      case 'Table':
        completionItem.meta = 'table';
        getQueryContextTables(tables, completionItem, completers);
        break;
    }
    return [...completers];
  }
}
