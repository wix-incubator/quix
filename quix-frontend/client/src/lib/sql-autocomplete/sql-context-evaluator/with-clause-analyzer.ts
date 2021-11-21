import {
  aggregateQueryDetailsAndTableInfo,
  getQueryDetailsFromQuerySpecificationNode,
  getNextQuerySpecificationNode,
} from './tree-analyzer';

import { QueryDetails, TableInfo, TableType } from './types';
import { createNewTableInfoObj } from './utils';

/**
 * Takes NamedQueryNode (which defines WITH table) and analyzes its properties using the tree-analyzer.
 *  
 * @param   {any} namedQueryNode
 *
 * @returns {TableInfo} the WITH table details as table info
 */
export const analyzeNamedQueryNode = (namedQueryNode: any): TableInfo => {
  const currentTableInfo: TableInfo = createNewTableInfoObj({
    name: getWithClauseName(namedQueryNode),
    type: TableType.Nested,
    columns: getColumnAliases(namedQueryNode),
  });

  if (currentTableInfo.columns.length === 0) {
    const queryDetails: QueryDetails = getQueryDetailsFromQuerySpecificationNode(
      getNextQuerySpecificationNode(namedQueryNode)
    );

    aggregateQueryDetailsAndTableInfo(queryDetails, currentTableInfo);
  }

  return currentTableInfo;
};

/**
 * @param   {any} namedQueryNode
 *
 * @returns {string} name
 */
const getWithClauseName = (namedQueryNode: any): string => {
  return namedQueryNode.identifier().getText();
};

/**
 * In cases where the column names are defined along with the table name, an array of columns names will be returned.
 * For example: WITH foo(bar, goo) as (SELECT a, b FROM c)
 * 
 * @param   {any} namedQueryNode
 *
 * @returns {string[]} columns names
 */
const getColumnAliases = (namedQueryNode: any): string[] => {
  const columnsAlias: string[] = [];

  if (namedQueryNode.columnAliases) {
    namedQueryNode
      .columnAliases()
      ?.identifier()
      ?.forEach((identifier: any) => {
        columnsAlias.push(identifier.getText());
      });
  }

  return columnsAlias;
};
