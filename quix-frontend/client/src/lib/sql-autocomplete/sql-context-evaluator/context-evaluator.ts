import * as antlr4 from 'antlr4';
import { PrestoContextListener } from './presto-context-listener';
import { ContextType, QueryContext, TableInfo } from './types';
import { getTableInfoFromRelationNode } from './tree-analyzer';
import { analyzeNamedQueryNode } from './with-clause-analyzer';
import { createPrestoSyntaxTree } from '../../language-parsers/sql-parser/parser';

export const evaluateContext = (
  input: string,
  identifier: string
): QueryContext => {
  const prestoSyntaxTree = createPrestoSyntaxTree(input);
  return getContextFromSyntaxTree(prestoSyntaxTree, identifier);
};

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
      ? evaluateQueryTablesInfo(prestoContextListener.getQuerySpecificationNode())
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

const evaluateQueryTablesInfo = (querySpecificationNode: any): TableInfo[] => {
  return querySpecificationNode
    ?.relation()
    .reduce((accumulator: TableInfo[], relationNode: any) => {
      accumulator.push(...getTableInfoFromRelationNode(relationNode));
      return accumulator;
    }, []);
};

const evaluateWithTablesInfo = (namedQueries: any[]): TableInfo[] => {
  return namedQueries.reduce((accumulator: TableInfo[], withNode: any) => {
    return accumulator.concat(analyzeNamedQueryNode(withNode));
  }, []);
};

const mergeAndFilterResults = (
  contextType: ContextType,
  queryTablesInfo: TableInfo[],
  withTablesInfo: TableInfo[],
  identifier: string
) => {
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
