import * as antlr4 from 'antlr4';
import { PrestoContextListener } from './presto-context-listener';
import { ContextType, QueryContext, TableInfo } from './types';
import { getTableInfoFromRelationNode } from './tree-analyzer';
import { analyzeNamedQueryNode } from './with-clause-analyzer';
import { createPrestoSyntaxTree } from '../../language-parsers/sql-parser/parser';

/**
 * Takes query and identifier and returns the context of the given identifier in the query.
 * @param   {string} input sql query
 * @param   {string} identifier to evaluate
 *
 * @returns {QueryContext} the evaluated context.
 */
export const evaluateContext = (
  input: string,
  identifier: string
): QueryContext => {
  const prestoSyntaxTree = createPrestoSyntaxTree(input);
  return getContextFromSyntaxTree(prestoSyntaxTree, identifier);
};

/**
 * Takes antlr syntax tree and identifier and returns the context of the given identifier in the tree.
 *
 * @param   {any} tree antlr syntax tree
 * @param   {string} identifier to evaluate
 *
 * @returns {QueryContext} the evaluated context type and the tables info that defines the query.
 */
const getContextFromSyntaxTree = (
  tree: any,
  identifier: string
): QueryContext => {
  const prestoContextListener = new PrestoContextListener();
  prestoContextListener.setIdentifier(identifier);
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(prestoContextListener, tree);

  const contextType = prestoContextListener.getContextType();

  const queryTables: TableInfo[] =
    contextType === ContextType.Column
      ? evaluateQueryTablesInfo(
          prestoContextListener.getQuerySpecificationNode()
        )
      : [];

  const withTablesInfo: TableInfo[] = evaluateWithTablesInfo(
    prestoContextListener.getWithNodes()
  );

  const tables: TableInfo[] = mergeAndFilterResults(
    contextType,
    queryTables,
    withTablesInfo,
    identifier
  );

  return {
    contextType,
    tables,
  };
};

/**
 * Takes querySpecificationNode and evaluate all is 'relation' childrens.
 * Creates for each relation TableInfo that defines the relation properties.
 *
 * @param   {any} querySpecificationNode antlr tree node
 *
 * @returns {TableInfo[]} TableInfo array.
 */
const evaluateQueryTablesInfo = (querySpecificationNode: any): TableInfo[] => {
  return querySpecificationNode
    ?.relation()
    .reduce((accumulator: TableInfo[], relationNode: any) => {
      accumulator.push(...getTableInfoFromRelationNode(relationNode));
      return accumulator;
    }, []);
};

/**
 * Takes array of namedQueryNodes and creates TableInfo that defines the 
 * WITH table properties for each namedQueryNode.
 *
 * @param   {any[]} namedQueries array of antlr tree node
 *
 * @returns {TableInfo[]} TableInfo array.
 */
const evaluateWithTablesInfo = (namedQueries: any[]): TableInfo[] => {
  return namedQueries.reduce((accumulator: TableInfo[], withNode: any) => {
    return accumulator.concat(analyzeNamedQueryNode(withNode));
  }, []);
};

/**
 * Takes 2 TableInfo array, one of regular query and one for the WITH tables
 * and merge them according to the context type. 
 * During the merge, all the regular tables and the table references are replaced with their 
 * corresponding WITH tables, if exists one.
 * 
 * @param   {ContextType} contextType
 * @param   {TableInfo[]} queryTablesInfo
 * @param   {TableInfo[]} withTablesInfo
 * @param   {string} identifier
 *
 * @returns {TableInfo[]} a new TableInfo array with the results of the merge and filter.
 */
const mergeAndFilterResults = (
  contextType: ContextType,
  queryTablesInfo: TableInfo[],
  withTablesInfo: TableInfo[],
  identifier: string
): TableInfo[] => {
  const mergedTableInfoResults: TableInfo[] = [];
  const withTablesMap = new Map<string, TableInfo>(
    withTablesInfo.map((table) => {
      if (table.name !== identifier && table.alias !== identifier) {
        return [table.name, table];
      }
    })
  );

  queryTablesInfo.forEach((table: TableInfo) => {
    if (table.name !== identifier && table.alias !== identifier) {
      let currentTable: TableInfo = table;
      if (table.name && withTablesMap.has(table.name)) {
        currentTable = withTablesMap.get(table.name);
        if (table.alias) {
          currentTable.alias = table.alias;
        }
        withTablesMap.delete(table.name);
      }
      mergedTableInfoResults.push(currentTable);
      if (currentTable.tableRefs.length > 0) {
        replaceTableRefsAndWithTables(currentTable, withTablesMap);
      }
    }
  });

  if (contextType === ContextType.Table) {
    mergedTableInfoResults.push(...withTablesMap.values());
  }

  return mergedTableInfoResults;
};

/**
 * Replace all the table references of a given TableInfo with their 
 * corresponding WITH tables info, if exists one.
 * For each such table, replaces the references and adds the columns of 
 * the WITH table to the given table recursively.
 * 
 * @param   {TableInfo} table
 * @param   {Map<string, TableInfo>} withMap
 */
const replaceTableRefsAndWithTables = (
  table: TableInfo,
  withMap: Map<string, TableInfo>
) => {
  const newTableRefs: string[] = [];
  let tableRefsChanged: boolean = false;

  table.tableRefs.forEach((tableRef: string) => {
    if (withMap.has(tableRef)) {
      tableRefsChanged = true;
      const withTable = withMap.get(tableRef);
      newTableRefs.push(...withTable.tableRefs);
      table.columns.push(...withTable.columns);
    } else {
      newTableRefs.push(tableRef);
    }
  });

  if (tableRefsChanged) {
    table.tableRefs = newTableRefs;
    replaceTableRefsAndWithTables(table, withMap);
  }
  table.selectAll = table.tableRefs.length > 0;
};
