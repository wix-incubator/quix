import { BasicQueryContextOption } from '../../../../sql-context-evaluator/tests/result-options/utils';
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

export const testInputQueryContext: BasicQueryContextOption = {
  [ContextType.Column]: {
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
    withTableWithInnerTables: createQueryContextObject(ContextType.Column, [
      testTable.withTable.namedWith2ColumnsWithPrefixes,
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
      ]
    ),
    twoTables1Nested1Wt: createQueryContextObject(ContextType.Column, [
      testTable.nested.unnamedWith2Columns12,
      testTable.withTable.namedWith2Columns34,
    ]),
    twoTables1Wt1WithAlias1NestedSameColumns: createQueryContextObject(
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
    threeTables1WtWith2Columns121NestedWithColumns341NestedWithColumns34AndAlias: createQueryContextObject(
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
    threeTables1Ext1WtColumns121Wt2Refs: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.namedWith2TblRefs,
        testTable.withTable.namedWith2Columns12,
        testTable.external.ext,
      ]
    ),
    threeTables2Ext1Wt1Refs2Columns: createQueryContextObject(
      ContextType.Column,
      [
        testTable.withTable.named2With1TblRef1And2Columns12,
        testTable.external.ext,
        testTable.external.extWithAlias,
      ]
    ),
  },
  [ContextType.Table]: {},
};
