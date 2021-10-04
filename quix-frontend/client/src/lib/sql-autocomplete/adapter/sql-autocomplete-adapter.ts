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
  private prefix: string;
  private lastCompleters: ICompleterItem[];

  constructor(config: IDbInfoConfig) {
    this.config = config;
    this.prefix = '';
    this.lastCompleters = [];
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
        if (prefix !== this.prefix) {
          const [dbEntitiesCompleters, dbCompleters] = await Promise.all([
            this.getEntitiesCompletersFromDbBasedOnPrefix(prefix),
            this.searchEntitiesFromDb('trino', prefix),
          ]);
          this.lastCompleters = [
            ...dbEntitiesCompleters,
            ...dbCompleters,
          ];
        }
        this.prefix = prefix;
        return [...this.lastCompleters, ...tablesCompleters];
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
   * @return {ICompleterItem[]}
   */
  private async getQueryContextColumns(tables: TableInfo[]) {
    const completersMemory: Set<string> = new Set();
    for (const table of tables) {
      const { name, alias, columns } = await this.extractTableColumns(table);
      columns.forEach((column) => {
        column = column.split('.').pop();
        completersMemory.add(column);
      });
      if (tables.length > 1) {
        columns.forEach((column) => {
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
    }
    return [...completersMemory].map((completer) =>
      this.createCompleterItem(completer, 'column')
    );
  }

  /**
   * Extract the columns from the table
   * @param {TableInfo} table
   * @return {TableInfo}
   */
  private async extractTableColumns(table: TableInfo) {
    const { type, name, tableRefs, columns } = table;
    const tables = [...tableRefs];
    if (type === TableType.External) {
      tables.push(name);
    }
    for (const tableFullName of tables) {
      const [catalog, schema, tableName] = tableFullName.split('.');
      const tableRefColumns = await this.config.getColumnsByTable(
        catalog,
        schema,
        tableName
      );
      columns.push(...tableRefColumns.map((column) => column.name));
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
        entities = await this.config.getCatalogs();
        break;
      case 1:
        entities = await this.config.getSchemasByCatalog(prefix);
        break;
      case 2:
        entities = await this.config.getTablesBySchema(
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

  private async searchEntitiesFromDb(
    type: string,
    prefix: string
  ): Promise<ICompleterItem[]> {
    const response = await this.config.search(type, prefix);
    let entityType: string;
    const completers: Set<string> = new Set();
    response.forEach((ctlg) => {
      const ctlgName = ctlg.name;
      ctlg.children.forEach((schm) => {
        const schmName = schm.name;
        schm.children.forEach((tbl) => {
          entityType = tbl.type;
          completers.add(`${ctlgName}.${schmName}.${tbl.name}`);
        });
      });
    });
    return [...completers].map((completer) =>
      this.createCompleterItem(completer, entityType)
    );
  }
}
