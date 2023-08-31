import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { IAutocompleter } from './types';
import {
  ContextType,
  QueryContext,
  TableInfo,
  TableType,
} from '../sql-context-evaluator';
import { trinoToJs, getNextLevel, getSearchCompletion} from "./sql-autocpmplete-adapter-utills";
import { IDbInfoConfig } from '../db-info';
import { BaseEntity, Column } from '../db-info/types';

export class SqlAutocompleter implements IAutocompleter {
  private prefix: string;
  private lastCompleters: ICompleterItem[] = [];

  constructor(
    private readonly config: IDbInfoConfig,
    private readonly type?: string
  ) {
    this.config.preFetch(this.type);
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
            this.searchEntitiesFromDb(prefix),
          ]);
          this.lastCompleters = [...dbEntitiesCompleters, ...dbCompleters];
        }
        this.prefix = prefix;
        return [...this.lastCompleters, ...tablesCompleters];
      default:
        return [];
    }
  }
  public async getAllCompletionItemsFromQueryContextColumn(queryContext: any) {
    const { contextType } = queryContext;
    const complitionsArray = contextType === ContextType.Column ? this.translateAndGetAllQueryContextColumns(queryContext.tables ,queryContext.prefix) :[] ;
    return complitionsArray
  }

  public async translateAndGetAllQueryContextColumns(tables: TableInfo[] , prefix?: string) {
    const tablesPromises: Promise<TableInfo>[] = [];
    for (const table of tables) {
      tablesPromises.push(this.extractTableColumns(table));
    }
     const extractedTables = await Promise.all(tablesPromises);
    if (prefix.endsWith('.')) {
      return getNextLevel(extractedTables , prefix);
    }
      return getSearchCompletion(extractedTables , prefix); 
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
    const result: { meta: string ; value: string ; dataType?: any}[] = [];

    for (const extractedTable of extractedTables) {
        const { name, alias, columns } = extractedTable;
        const includeTablePrefix = tables.length > 1;
        columns.forEach((column) => {
          if(typeof column.dataType === 'string') {
            column.dataType = trinoToJs(column.dataType, 0);
          }
          const objectInTrino = 'row';
            const meta = typeof column.dataType === 'object' ? objectInTrino : column.dataType;
            const value = alias
                ? `${alias}.${column instanceof Object ? column.name : column}`
                : includeTablePrefix
                    ? `${name}.${column instanceof Object ? column.name : column}`
                    : column instanceof Object ? column.name : column;

            columnsNamesMemory.add(column instanceof Object ? column.name : column);
            columnsWithPrefixMemory.add(value);
            if (typeof column === 'string') {
              result.push({ value: column, meta: 'column' });
              if (alias || (extractedTable.name && !alias)) {
                const prefix = alias || extractedTable.name;
                result.push({ value: `${prefix}.${column}`, meta: 'column' });
              }
            } else {
              result.push({ meta, value });
              result.push({ meta, value: column instanceof Object ? column.name : column });
            }
            
        });
    }
    return this.removeDuplicates(result)
}

private removeDuplicates(arr: any[]): any[] {
  const seen = new Set<string>();
  const uniqueArray: any[] = [];

  for (const obj of arr) {
      const objKey = `${obj.meta}-${obj.value}-${obj.caption}`;

      if (!seen.has(objKey)) {
          seen.add(objKey);
          uniqueArray.push(obj);
      }
  }

  return uniqueArray;
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

    const columnsByTablesPromises: Promise<Column[]>[] = [];
    for (const tableFullName of tablesToExtract) {
      const [catalog, schema, tableName] = tableFullName.split('.');
      columnsByTablesPromises.push(
        this.config.getColumnsByTable(catalog, schema, tableName, this.type)
      );
    }
    const columnsByTables = await Promise.all(columnsByTablesPromises);
    for (const columnsByTable of columnsByTables) {
      table.columns.push(...columnsByTable);
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
        entities = await this.config.getCatalogs(this.type);
        break;
      case 1:
        entities = await this.config.getSchemasByCatalog(prefix, this.type);
        break;
      case 2:
        entities = await this.config.getTablesBySchema(
          prefixArray[0],
          prefixArray[1],
          this.type
        );
        break;
      default:
        entities = [];
    }
    return entities.map((entity) =>
      this.createCompleterItem(
        prefix ? `${prefix}.${entity.name}` : entity.name,
        entity.type
      )
    );
  }

  private async searchEntitiesFromDb(
    prefix: string
  ): Promise<ICompleterItem[]> {
    const allCompleters = [];

    if (prefix?.length > 1) {
      const schemaCompleters: Set<string> = new Set();
      const tableCompleters: Set<string> = new Set();

      const dbTree = await this.config.getCatalogs(this.type);

      dbTree.forEach((catalog) => {
        catalog.children.forEach((schema) => {
          if (schema.name.indexOf(prefix) !== -1) {
            schemaCompleters.add(`${catalog.name}.${schema.name}`);
          }

          schema.children.forEach((table) => {
            if (table.name.indexOf(prefix) !== -1) {
              tableCompleters.add(
                `${catalog.name}.${schema.name}.${table.name}`
              );
            }
          });
        });
      });

      [...schemaCompleters].forEach((completer) =>
        allCompleters.push(this.createCompleterItem(completer, 'schema'))
      );
      [...tableCompleters].forEach((completer) =>
        allCompleters.push(this.createCompleterItem(completer, 'table'))
      );
    }

    return allCompleters;
  }
}