import { QueryDetails, TableInfo, TableType } from './types';
import { createNewTableInfoObj } from './utils';

export const analyzeRelation = (relationNode: any): TableInfo[] => {
  if (relationNode.relation) {
    // when use 'JOIN' keyword -> analyze all relations
    return relationNode
      .relation()
      ?.reduce((accumulator: TableInfo[], subRelation: any) => {
        return accumulator.concat(...analyzeRelation(subRelation));
      }, []);
  }

  const aliasedRelationNode = relationNode.sampledRelation().aliasedRelation();
  const relationPrimaryNode = aliasedRelationNode.relationPrimary();

  if (relationPrimaryNode.relation) {
    return analyzeRelation(relationPrimaryNode.relation());
  }

  const currentTableInfo: TableInfo = createNewTableInfoObj({
    name:
      relationPrimaryNode.qualifiedName &&
      relationPrimaryNode.qualifiedName()?.getText(),
    type: relationPrimaryNode.query ? TableType.Nested : TableType.External,
    alias:
      aliasedRelationNode.identifier &&
      aliasedRelationNode.identifier()?.getText(),
  });

  if (currentTableInfo.type === TableType.Nested && relationPrimaryNode.query) {
    const nestedQueryDetails: QueryDetails = analyzeQuerySpecificationNode(
      getNextQuerySpecificationNode(relationNode)
    );
    aggregateQueryAndTableInfo(nestedQueryDetails, currentTableInfo);
  }

  return [currentTableInfo];
};

export const analyzeQuerySpecificationNode = (
  querySpecificationNode: any
): QueryDetails => {
  const tables: TableInfo[] = [];
  const columns: string[] = [];
  let selectAll: boolean = false;

  querySpecificationNode
    ?.selectItem()
    .forEach((selectItem: any) =>
      selectItem.constructor.name === 'SelectAllContext'
        ? (selectAll = true)
        : columns.push(
            selectItem.identifier()
              ? selectItem.identifier().getText()
              : selectItem.getText()
          )
    );

  querySpecificationNode
    ?.relation()
    .forEach((relation: any) => tables.push(...analyzeRelation(relation)));

  return { tables, columns, selectAll };
};

export const aggregateQueryAndTableInfo = (
  queryDetails: QueryDetails,
  tableInfo: TableInfo
) => {
  queryDetails.tables.forEach((table: TableInfo) => {
    if (queryDetails.selectAll) {
      if (table.type === TableType.External) {
        tableInfo.selectAll = true;
        tableInfo.tableRefs.push(table.name);
      } else if (table.type === TableType.Nested) {
        tableInfo.selectAll = tableInfo.selectAll || table.selectAll;
        tableInfo.tableRefs.push(...table.tableRefs);
        tableInfo.columns.push(...table.columns);
      }
    }
  });

  tableInfo.columns.push(...queryDetails.columns);
};

export const getNextQuerySpecificationNode = (currentNode: any) => {
  if (!(currentNode?.children?.length > 0)) {
    return null;
  }

  let nextNode: any = currentNode;
  nextNode = nextNode?.sampledRelation ? nextNode.sampledRelation() : nextNode;
  nextNode = nextNode?.aliasedRelation ? nextNode.aliasedRelation() : nextNode;
  nextNode = nextNode?.relationPrimary ? nextNode.relationPrimary() : nextNode;
  nextNode = nextNode?.query ? nextNode.query() : nextNode;
  nextNode = nextNode?.queryNoWith ? nextNode.queryNoWith() : nextNode;
  nextNode = nextNode?.queryTerm ? nextNode.queryTerm() : nextNode;
  nextNode = nextNode?.queryTerm ? nextNode.queryTerm()[0] : nextNode; // when use 'UNION' keyword -> analyze the first table
  nextNode = nextNode?.queryPrimary ? nextNode.queryPrimary() : nextNode;

  return nextNode?.querySpecification
    ? nextNode.querySpecification()
    : nextNode !== currentNode
    ? getNextQuerySpecificationNode(nextNode)
    : null;
};
