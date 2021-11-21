import { QueryDetails, TableInfo, TableType } from './types';
import { createNewTableInfoObj } from './utils';

/**
 * Recuresive function which takes a relationNode and returns a TableInfo array
 * that defines the relation properties considering sub-relations.
 *
 * @param   {any} relationNode
 *
 * @returns {TableInfo[]} TableInfo array
 */
export const getTableInfoFromRelationNode = (
  relationNode: any
): TableInfo[] => {
  if (relationNode.relation) {
    // when using 'JOIN' keyword -> split and analyze all sub-relations
    return relationNode
      .relation()
      ?.reduce((accumulator: TableInfo[], subRelation: any) => {
        return accumulator.concat(...getTableInfoFromRelationNode(subRelation));
      }, []);
  }

  const aliasedRelationNode = relationNode.sampledRelation().aliasedRelation();
  const relationPrimaryNode = aliasedRelationNode.relationPrimary();

  if (relationPrimaryNode.relation) {
    // dealing with nested parentheses, for example: SELECT * FROM ((some_table))
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
    // evaluate the nested query and merge it with the currentTableInfo
    const nestedQueryDetails: QueryDetails = getQueryDetailsFromQuerySpecificationNode(
      getNextQuerySpecificationNode(relationNode)
    );
    aggregateQueryDetailsAndTableInfo(nestedQueryDetails, currentTableInfo);
  }

  return [currentTableInfo];
};

/**
 * Recuresive function which takes a querySpecificationNode and returns a QueryDetails
 * that defines all the query properties considering tables and columns.
 *
 * @param   {any} querySpecificationNode
 *
 * @returns {QueryDetails} query properties
 */
export const getQueryDetailsFromQuerySpecificationNode = (
  querySpecificationNode: any
): QueryDetails => {
  const tables: TableInfo[] = [];
  const columns: string[] = [];
  let selectAll: boolean = false;

  // evaluate all relations after FROM clause
  querySpecificationNode
    ?.relation()
    .forEach((relation: any) =>
      tables.push(...getTableInfoFromRelationNode(relation))
    );

  const prefixToReplace = createRegexNameFilter(tables);

  // evaluate all columns after SELECT clause
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

/**
 * Takes TableInfo array and creates a RegExp to match all tables aliases/names in the given array.
 *
 * @param   {TableInfo[]} tables
 *
 * @returns {RegExp} Regular expression of all tables aliases/names
 */
const createRegexNameFilter = (tables: TableInfo[]): RegExp => {
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

/**
 * Takes QueryDetails and aggregates it into a given TableInfo.
 *
 * @param   {QueryDetails} queryDetails
 * @param   {TableInfo} tableInfo
 *
 * @return {void}
 */
export const aggregateQueryDetailsAndTableInfo = (
  queryDetails: QueryDetails,
  tableInfo: TableInfo
): void => {
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

/**
 * Takes any Antlr4 tree node and advances it to the next QuerySpecificationNode down the tree.
 *
 * @param {any} currentNode
 *
 * @return {any} querySpecificationNode
 */
export const getNextQuerySpecificationNode = (currentNode: any): any => {
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
  // when use 'UNION' keyword -> analyze the first table
  nextNode = nextNode?.queryTerm ? nextNode.queryTerm()[0] : nextNode;
  nextNode = nextNode?.queryPrimary ? nextNode.queryPrimary() : nextNode;

  return nextNode?.querySpecification
    ? nextNode.querySpecification()
    : nextNode !== currentNode
    ? getNextQuerySpecificationNode(nextNode)
    : null;
};
