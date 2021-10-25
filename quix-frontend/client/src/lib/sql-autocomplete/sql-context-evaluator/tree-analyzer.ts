import { QueryDetails, TableInfo, TableType } from './types';
import { createNewTableInfoObj } from './utils';

export const getTableInfoFromRelationNode = (
  relationNode: any
): TableInfo[] => {
  if (relationNode.relation) {
    // when use 'JOIN' keyword -> analyze all relations
    return relationNode
      .relation()
      ?.reduce((accumulator: TableInfo[], subRelation: any) => {
        return accumulator.concat(...getTableInfoFromRelationNode(subRelation));
      }, []);
  }

  const aliasedRelationNode = relationNode.sampledRelation().aliasedRelation();
  const relationPrimaryNode = aliasedRelationNode.relationPrimary();

  if (relationPrimaryNode.relation) {
    return getTableInfoFromRelationNode(relationPrimaryNode.relation());
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
    const nestedQueryDetails: QueryDetails = getQueryDetailsFromQuerySpecificationNode(
      getNextQuerySpecificationNode(relationNode)
    );
    aggregateQueryDetailsAndTableInfo(nestedQueryDetails, currentTableInfo);
  }

  return [currentTableInfo];
};

export const getQueryDetailsFromQuerySpecificationNode = (
  querySpecificationNode: any
): QueryDetails => {
  const tables: TableInfo[] = [];
  const columns: string[] = [];
  let selectAll: boolean = false;

  querySpecificationNode
    ?.relation()
    .forEach((relation: any) =>
      tables.push(...getTableInfoFromRelationNode(relation))
    );

  const prefixToReplace = createRegexNameFilter(tables);

  querySpecificationNode
    ?.selectItem()
    .forEach((selectItem: any) =>
      selectItem.ASTERISK
        ? (selectAll = true)
        : columns.push(
            selectItem.identifier()
              ? selectItem.identifier().getText()
              : selectItem.getText().replace(prefixToReplace, '')
          )
    );

  return { tables, columns, selectAll };
};

const createRegexNameFilter = (tables: TableInfo[]) => {
  const tablesNames = tables.reduce((names, table) => {
    const name = table.alias || table.name;
    if (name) {
      names.push(name);
    }
    return names;
  }, []);

  return tablesNames.length > 0
    ? new RegExp(`^(${tablesNames.join('|')})\\.`, 'g')
    : undefined;
};

export const aggregateQueryDetailsAndTableInfo = (
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
