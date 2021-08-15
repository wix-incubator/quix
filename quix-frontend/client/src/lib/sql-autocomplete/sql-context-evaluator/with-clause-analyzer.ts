import {
  aggregateQueryAndTableInfo,
  analyzeQuerySpecificationNode,
  getNextQuerySpecificationNode,
} from './tree-analyzer';

import { QueryDetails, TableInfo, TableType } from './types';
import { createNewTableInfoObj } from './utils';

export const analyzeNamedQueryNode = (namedQueryNode: any): TableInfo => {
  const currentTableInfo: TableInfo = createNewTableInfoObj({
    name: getWithClauseName(namedQueryNode),
    type: TableType.Nested,
    columns: getColumnAliases(namedQueryNode),
  });

  if (currentTableInfo.columns.length === 0) {
    const queryDetails: QueryDetails = analyzeQuerySpecificationNode(
      getNextQuerySpecificationNode(namedQueryNode)
    );

    aggregateQueryAndTableInfo(queryDetails, currentTableInfo);
  }

  return currentTableInfo;
};

const getWithClauseName = (namedQueryNode: any): string => {
  return namedQueryNode.identifier().getText();
};

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
