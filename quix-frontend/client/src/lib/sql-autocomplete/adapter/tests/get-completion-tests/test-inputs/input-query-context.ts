import {
  ContextType,
  QueryContext,
  TableInfo,
} from '../../../../sql-context-evaluator/types';
import { testTable } from './input-table';

export const createQueryContextObject = (
  contextType: ContextType.Column | ContextType.Table | ContextType.Undefined,
  tables: TableInfo[],
  queryContext?: QueryContext
) => {
  return {
    ...queryContext,
    contextType: contextType,
    tables: tables,
  } as QueryContext;
};

/**
 * columns12 - [col1,col2]
 * alias - tblAlias1
 * alias2 - tblAlias1
 * Wt - withTale
 */
const testInputQueryContext = {
  column: {
    empty: createQueryContextObject(ContextType.Column, []),
    nestedTable: createQueryContextObject(ContextType.Column, [
      testTable.nested.unnamedWith2Columns12,
    ]),
    nestedTableWithAlias: createQueryContextObject(ContextType.Column, [
      testTable.nested.unnamedWith2Columns12AndAlias,
    ]),
    withTable: createQueryContextObject(ContextType.Column, [
      testTable.withTable.namedWith2Columns12,
    ]),
    twoTables1Nested1NestedWithAliasSameColumns: createQueryContextObject(
      ContextType.Column,
      [
        testTable.nested.unnamedWith2Columns12,
        testTable.nested.unnamedWith2Columns12AndAlias,
      ]
    ),
    twoTables1NestedWithAlias1NestedWithAlias2SameColumns: createQueryContextObject(
      ContextType.Column,
      [
        testTable.nested.unnamedWith2Columns12AndAlias,
        testTable.nested.unnamedWith2Columns12AndAlias2,
      ]
    ),
    twoTables1NestedWithAlias1NestedWithAlias2: createQueryContextObject(
      ContextType.Column,
      [
        testTable.nested.unnamedWith2Columns12AndAlias,
        testTable.nested.unnamedWith2Columns34AndAlias2,
      ]
    ),
    twoTables1Nested1NestedWithAlias: createQueryContextObject(
      ContextType.Column,
      [
        testTable.nested.unnamedWith2Columns12,
        testTable.nested.unnamedWith2Columns34AndAlias,
      ]
    ),
    twoTables1Nested1WtSameColumns: createQueryContextObject(
      ContextType.Column,
      [
        testTable.nested.unnamedWith2Columns12,
        testTable.withTable.namedWith2Columns12,
        ,
      ]
    ),
    twoTables1Nested1Wt: createQueryContextObject(ContextType.Column, [
      testTable.nested.unnamedWith2Columns12,
      testTable.withTable.namedWith2Columns34,
    ]),
    twoTables1Wt1WithAliasSameColumns: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWith2Columns12,
        testTable.nested.unnamedWith2Columns12AndAlias,
      ]
    ),
    twoTables1Wt1NestedWithAlias: createQueryContextObject(ContextType.Column, [
      testTable.withTable.namedWith2Columns12,
      testTable.nested.unnamedWith2Columns34AndAlias,
    ]),
    threeTables1WtWith2Columns2NestedWith2Columns: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWith2Columns12,
        testTable.nested.unnamedWith2Columns34,
        testTable.nested.unnamedWith2Columns56,
      ]
    ),
    threeTables1WtWith2Columns121NestedWithColumns341NestedWithColumns56AndAlias: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWith2Columns12,
        testTable.nested.unnamedWith2Columns34,
        testTable.nested.unnamedWith2Columns56AndAlias,
      ]
    ),
    threeTables1WtWith2Columns121NestedWithColumns341NestedWithColumns34Alias: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWith2Columns12,
        testTable.nested.unnamedWith2Columns34,
        testTable.nested.unnamedWith2Columns34AndAlias,
      ]
    ),
    threeTables1WtWith2Columns121NestedWithColumns34Alias1NestedWithColumns34Alias2: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWith2Columns12,
        testTable.nested.unnamedWith2Columns34AndAlias,
        testTable.nested.unnamedWith2Columns34AndAlias2,
      ]
    ),
    threeTables1Ext1WtColumns561Wt2Refs: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWithTableRefs,
        testTable.withTable.namedWith2Columns56,
        testTable.external.ext
    ])
  },
  table: {},
};
