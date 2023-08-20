import { testInputQueryContext } from './test-inputs/input-query-context';
import { expectedResult } from './expected-results';
import { ContextType } from '../../../sql-context-evaluator/types';
import { runAdapterGetCompletersTest } from '../test-utils/tests-utils';

describe('when reciving queryContext', () => {
  runAdapterGetCompletersTest(
    1,
    testInputQueryContext[ContextType.Column].empty,
    expectedResult.empty
  );
  // runAdapterGetCompletersTest(
  //   2,
  //   testInputQueryContext[ContextType.Column].nestedTable,
  //   expectedResult.twoColumns
  // );
  // runAdapterGetCompletersTest(
  //   3,
  //   testInputQueryContext[ContextType.Column].nestedTableWithAlias,
  //   expectedResult.twoColumnsWithAlias
  // );
  // runAdapterGetCompletersTest(
  //   4,
  //   testInputQueryContext[ContextType.Column].withTable,
  //   expectedResult.twoColumnsWithName
  // );
  // runAdapterGetCompletersTest(
  //   5,
  //   testInputQueryContext[ContextType.Column]
  //     .twoTables1Nested1NestedWithAliasSameColumns,
  //   expectedResult.twoColumnsWithAliasAfter
  // );
  // runAdapterGetCompletersTest(
  //   6,
  //   testInputQueryContext[ContextType.Column]
  //     .twoTables1NestedWithAlias1NestedWithAlias2SameColumns,
  //   expectedResult.twoColumnsWithTwoAliases
  // );
  // runAdapterGetCompletersTest(
  //   7,
  //   testInputQueryContext[ContextType.Column]
  //     .twoTables1NestedWithAlias1NestedWithAlias2,
  //   expectedResult.fourColumnsWithTwoAliases
  // );
  // runAdapterGetCompletersTest(
  //   8,
  //   testInputQueryContext[ContextType.Column].twoTables1Nested1NestedWithAlias,
  //   expectedResult.fourColumnsWith1Alias
  // );
  // runAdapterGetCompletersTest(
  //   9,
  //   testInputQueryContext[ContextType.Column].twoTables1Nested1WtSameColumns,
  //   expectedResult.twoColumnsWithNameAfter
  // );
  // runAdapterGetCompletersTest(
  //   10,
  //   testInputQueryContext[ContextType.Column].twoTables1Nested1Wt,
  //   expectedResult.fourColumnsWith1Name
  // );
  // runAdapterGetCompletersTest(
  //   11,
  //   testInputQueryContext[ContextType.Column]
  //     .twoTables1Wt1WithAlias1NestedSameColumns,
  //   expectedResult.twoColumnsWithNameAndAlias
  // );
  // runAdapterGetCompletersTest(
  //   12,
  //   testInputQueryContext[ContextType.Column].twoTables1Wt1NestedWithAlias,
  //   expectedResult.fourColumnsWithNameAndAlias
  // );
  // runAdapterGetCompletersTest(
  //   13,
  //   testInputQueryContext[ContextType.Column]
  //     .threeTables1WtWith2Columns2NestedWith2Columns,
  //   expectedResult.sixColumnsWithName1
  // );
  // runAdapterGetCompletersTest(
  //   14,
  //   testInputQueryContext[ContextType.Column]
  //     .threeTables1WtWith2Columns121NestedWithColumns341NestedWithColumns34AndAlias,
  //   expectedResult.sixColumnsWithNameAndAlias
  // );
  // runAdapterGetCompletersTest(
  //   15,
  //   testInputQueryContext[ContextType.Column]
  //     .threeTables1WtWith2Columns121NestedWithColumns34Alias1NestedWithColumns34Alias2,
  //   expectedResult.sixColumnsWithNameAnd2Alias
  // );
  // runAdapterGetCompletersTest(
  //   16,
  //   testInputQueryContext[ContextType.Column]
  //     .threeTables1Ext1WtColumns121Wt2Refs,
  //   expectedResult.tableRefsColumnsAndExtColumns
  // );
  // runAdapterGetCompletersTest(
  //   17,
  //   testInputQueryContext[ContextType.Column].threeTables2Ext1Wt1Refs2Columns,
  //   expectedResult.threeTbl1Wtwithcolumns12AndTblRef1Ext1ExtwithAlias
  // );
});
