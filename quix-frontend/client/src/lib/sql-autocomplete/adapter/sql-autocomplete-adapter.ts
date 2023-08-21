import { ICompleterItem } from '../../code-editor/services/code-editor-completer';
import { IAutocompleter } from './types';
import {
  ContextType,
  QueryContext,
  TableInfo,
  TableType,
} from '../sql-context-evaluator';
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
  public async getAllCompletionItemsFromQueryContextCollumn(queryContext: any) {
    const { contextType } = queryContext;
    const complitionsArray = contextType === ContextType.Column ? this.translateAndGetAllQueryContextColumns(queryContext.tables ,queryContext.prefix) :[] ;
    return complitionsArray
  }

  public async translateAndGetAllQueryContextColumns(tables: TableInfo[] , prefix: string | undefined) {
    const tablesPromises: Promise<TableInfo>[] = [];
    for (const table of tables) {
      tablesPromises.push(this.extractTableColumns(table)); 
    }
     const extractedTables = await Promise.all(tablesPromises);
    if (prefix.endsWith('.')) {
      const nextLevelCompletion = getNextLevel(extractedTables , prefix);
      return nextLevelCompletion;
    }
      const searchCompletion = getSearchCompletion(extractedTables , prefix);
      return searchCompletion ; 
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
    const result: { meta: string ; value: string }[] = [];

    for (const extractedTable of extractedTables) {
        const { name, alias, columns } = extractedTable;
        const includeTablePrefix = tables.length > 1;
        columns.forEach((column) => {
          if(typeof column.dataType === 'string') {
            column.dataType = trinoToJs(column.dataType, 0);
          }
            const meta = typeof column.dataType === 'object' ? 'object' : column.dataType;
            const value = alias
                ? `${alias}.${column instanceof Object ? column.name : column}`
                : includeTablePrefix // Use conditional operator to decide whether to include the table prefix
                    ? `${name}.${column instanceof Object ? column.name : column}`
                    : column instanceof Object ? column.name : column;

            columnsNamesMemory.add(column instanceof Object ? column.name : column);
            columnsWithPrefixMemory.add(value);
            if (typeof column  === 'string') {
              result.push({ value : column , meta: 'column' });
              if(alias) {
                result.push({ value : `${alias}.${column}` , meta: 'column' });
              }
              else {
                if (extractedTable.name)  {
                  result.push({ value : `${extractedTable.name}.${column}` , meta: 'column' });
                }
              }
            }
            else {
              result.push({ meta, value });
              result.push({ meta, value: column instanceof Object ? column.name : column });
            }
        });
    }
    const finalArray = this.removeDuplicates(result)

    return finalArray;
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
      table.columns.push(...columnsByTable.map((column) => column.name));
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
interface ObjectChild {
  name: string;
  dataType: any;
}

function getObjectChildren(obj: Record<string, any>, parentName = ''): ObjectChild[] {
  const children: ObjectChild[] = [];

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const childName = parentName ? `${parentName}.${key}` : key;
      children.push({ name: childName, dataType: obj[key] });
      children.push(...getObjectChildren(obj[key], childName));
    } else {
      const childName = parentName ? `${parentName}.${key}` : key;
      children.push({ name: childName, dataType: obj[key] });
    }
  }

  return children.map(child => {
    child.name = child.name.replace(/\.dataType$/, '');
    return child;
  });
}

const enum StartingOptions {
  row = "row(",
  map = "map(",
  array = "array(",
  timestamp = "timestamp(",
}

const enum SpecialCharacters {
  openParenthesis = "(",
  closedParenthesis = ")",
  comma = ',',
  space = ' ',
}

export function trinoToJs(trinoObjectAsString: string, index: number):  object|string {
  if (startsWithRow(trinoObjectAsString, index)) {
    index += 4; // jump after "row("
    return processRow(trinoObjectAsString, index);
  }
  if (trinoObjectAsString.substring(index, index + 4) === StartingOptions.map) {
    index = findClosingParentheses(trinoObjectAsString, index);
    return "map";
  }

  if (trinoObjectAsString.substring(index, index + 6) === StartingOptions.array) {
    index = findClosingParentheses(trinoObjectAsString, index);
    return "array";
  }
    return trinoObjectAsString;
}

  function processRow(trinoObjectAsString: string, index: number): object {
    const finalObject: object = {};
    let key = "";
    let value = "";
    let objectToInsert;
    let firstword = true;
  
    while (index <= trinoObjectAsString.length) {
      switch (trinoObjectAsString.charAt(index)) {
        case SpecialCharacters.openParenthesis: {
          const start = findBeginningOfWord(trinoObjectAsString, index);
          const result = handleStartingOptions(trinoObjectAsString, start, index);
          objectToInsert = result.objectToInsert;
          finalObject[key] = result.type;
          index = result.newIndex;
          break;
        }
        case SpecialCharacters.closedParenthesis: {
          checkKey(key, index);
          finalObject[key] = objectToInsert || value;
          return finalObject;
        }
        case SpecialCharacters.comma: {
          if (value === "") {
            throw new Error(`Error at index: ${trinoObjectAsString.substring(index-5,index)}, type expected before comma`);
          }
          finalObject[key] = objectToInsert || value;
          key = "";
          value = "";
          objectToInsert = undefined;
          firstword = true;
          break;
        }
        case SpecialCharacters.space: {
          firstword = isComma(trinoObjectAsString, index);
          break;
        }
        default: {
          const charIndex = trinoObjectAsString.charAt(index);
          if (firstword) {
            key += charIndex;
            checkKey(key, index);
          } else {
            value += charIndex;
          }
        }
      }
      index++;
    }
    return {};
  }

function findBeginningOfWord(str: string, index: number): number {
  while (index > 0 && str[index] !== ' ') {
    index--;
  }
  return index;
}

function isComma(trinoObjectAsString: string, counter: number): boolean {
  return trinoObjectAsString.charAt(counter - 1) === SpecialCharacters.comma;
}

function startsWithRow(trinoObjectAsString: string, counter: number) {
  return trinoObjectAsString.substring(counter, counter + 4) === StartingOptions.row;
}

function getOperator(trinoObjectAsString: string, start: number , end: number) {
  return trinoObjectAsString.substring(start+1, end+1); //we are in middle of string start is ' ' 
}

function findClosingParentheses(trinoObjectAsString: string, counter: number): number { //rename
  let parenthesis = 0;
  for (let i = counter; i < trinoObjectAsString.length; i++) {
    if (trinoObjectAsString.charAt(i) === '(') {
      parenthesis++;
    }
    if (trinoObjectAsString.charAt(i) === ')') {
      parenthesis--;
    }
    if (parenthesis === 0) {
      return i
    }
  }
  return -1;
}

function handleStartingOptions(trinoObjectAsString: string, start: number, end: number) {
  let objectToInsert;
  let newIndex = end;

  switch (getOperator(trinoObjectAsString, start, end)) {
    case StartingOptions.row: {
      objectToInsert = trinoToJs(trinoObjectAsString, end - 3);
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      break;
    }
    case StartingOptions.map: {
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      return { objectToInsert, type: "map", newIndex };
    }
    case StartingOptions.array: {
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      return { objectToInsert, type: "array", newIndex };
    }
    case StartingOptions.timestamp:  {
      newIndex = findClosingParentheses(trinoObjectAsString, end);
      return { objectToInsert, type: "timeStamp", newIndex };
    }
    default : {
      throw new Error(`Error at index: ${trinoObjectAsString.substring(end-5,end)}`);
    }
  }

  return { objectToInsert, newIndex };
}

function checkKey(key: string,indexInOriginalString:number) {
  const invalidCharsInKey = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', ',', '.', ':', ';', ' ', '\t', '\n'];
  key.split('').forEach((char) => {
    if (invalidCharsInKey.includes(char)) {
      throw new Error(`Error at index: ${indexInOriginalString}, illegal key value ${char}`);
    }
  });
}


export function findRelevantPartOfPrefix(tables: any, brokenPrefix: string[]): string {
  let relevantPartOfPrefix = '';
  
  for (const table of tables) {
      for (const column of table.columns) {
          let found = false;
          let gotRelevantPartOfPrefix = false;

          brokenPrefix.forEach(cell => {
              if (found) {
                  relevantPartOfPrefix += cell + '.';
              }
              if (!gotRelevantPartOfPrefix && cell === column.name) {
                  found = true;
                  gotRelevantPartOfPrefix = true;
                  relevantPartOfPrefix += cell + '.';
              }
          });
          if (relevantPartOfPrefix) {
            break;
          }
      }
      if (relevantPartOfPrefix) {
        break;
      }
  }

  return relevantPartOfPrefix;
}


function getAllChildrenOfTables(tables: TableInfo[]): any {
  let allChildren = []
  for (const extractedTable of tables) {
    const { columns } = extractedTable;
      columns.forEach((column) => {
        if (typeof column.dataType === "string") {
          column.dataType = trinoToJs(column.dataType, 0);
        }
        if (typeof column.dataType === "object")  {
          allChildren = allChildren.concat(getObjectChildren(column.dataType, column.name));
        }
  });
}
return allChildren;
}

function getSearchCompletion(tables: TableInfo[] , prefix: string | undefined):any {
  if(!prefix.includes('.')) {
    return [];
  }
  const allChildren = getAllChildrenOfTables(tables);
  const relevantPartOfPrefix = findRelevantPartOfPrefix(tables , prefix.split('.')).slice(0, -1);
  if( !relevantPartOfPrefix )  {
    return []
  }
  const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
  const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
  const searchPart = relevantPartOfPrefix.replace(startOfSearch,'')
  const filteredChildren = allChildren.filter(obj => {
  const nameInLowerCase = obj.name.toLowerCase();
  const parts = nameInLowerCase.split('.');
  // const parts = obj.name.split('.');
    if (parts.length > 1) {
        const substringAfterFirstDot = parts.slice(1).join('.');
        const criteria = checkCriteria(substringAfterFirstDot , searchPart.toLowerCase())
        return obj.name.startsWith(startOfSearch) && substringAfterFirstDot.includes(searchPart.toLowerCase()) && criteria ;
    }
    return false;
});

  const completionArray = filteredChildren.map(obj => ({
    value: prefix.replace(relevantPartOfPrefix, "") + obj.name,
    meta : typeof obj.dataType === 'object' ? 'object' : obj.dataType,
    caption:  obj.name.replace(startOfSearch,"")
  }));
  return completionArray;
}

function getNextLevel(tables: TableInfo[] , prefix: string | undefined): any {
  const allChildren = getAllChildrenOfTables(tables);
  const relevantPartOfPrefix = findRelevantPartOfPrefix(tables , prefix.split('.')).slice(0, -1); //if same problem for both change in function itself
  const relevantChildren = allChildren.filter(obj => {
  const dotCount = obj.name.split('.').length - 1;
    return obj.name.includes(relevantPartOfPrefix) && dotCount === relevantPartOfPrefix.split('.').length - 1;
  });
  const completionArray = relevantChildren.map(obj => ({
    value: prefix.replace(relevantPartOfPrefix, '') + obj.name,
    meta : typeof obj.dataType === 'object' ? 'object' : obj.dataType,
    caption:  obj.name.slice(relevantPartOfPrefix.length)
  }));
  return completionArray
}
function checkCriteria(substringAfterFirstDot, searchPart) {
  const index = substringAfterFirstDot.indexOf(searchPart);

  if (index !== -1) {
      const restOfString = substringAfterFirstDot.substring(index + searchPart.length);

      if (restOfString.includes(".")) {
          return false;
      }
      return true;
  }

  return false;
}

