import { testInputQueryContext } from './test-inputs/input-query-context';
import { expectedResult } from './expected-results';
import { runAdapterGetCompleters } from '../test-utils/tests-utils';
import { ContextType } from '../../../sql-context-evaluator/types';

describe.only('when reciving queryContext', () => {
//   runAdapterGetCompleters(
//     1,
//     testInputQueryContext[ContextType.Column].empty,
//     expectedResult.empty
//   );
//   runAdapterGetCompleters(
//     2,
//     testInputQueryContext[ContextType.Column].nestedTable,
//     expectedResult.twoColumns
//   );
//   runAdapterGetCompleters(
//     3,
//     testInputQueryContext[ContextType.Column].nestedTableWithAlias,
//     expectedResult.twoColumnsWithAlias
//   );
//   runAdapterGetCompleters(
//     4,
//     testInputQueryContext[ContextType.Column].withTable,
//     expectedResult.twoColumnsWithName
//   );
//   runAdapterGetCompleters(
//     5,
//     testInputQueryContext[ContextType.Column]
//       .twoTables1Nested1NestedWithAliasSameColumns,
//     expectedResult.twoColumnsWithAliasAfter
//   );
//   runAdapterGetCompleters(
//     6,
//     testInputQueryContext[ContextType.Column]
//       .twoTables1NestedWithAlias1NestedWithAlias2SameColumns,
//     expectedResult.twoColumnsWithTwoAliases
//   );
//   runAdapterGetCompleters(
//     7,
//     testInputQueryContext[ContextType.Column]
//       .twoTables1NestedWithAlias1NestedWithAlias2,
//     expectedResult.fourColumnsWithTwoAliases
//   );
//   runAdapterGetCompleters(
//     8,
//     testInputQueryContext[ContextType.Column].twoTables1Nested1NestedWithAlias,
//     expectedResult.fourColumnsWith1Alias
//   );
//   runAdapterGetCompleters(
//     9,
//     testInputQueryContext[ContextType.Column].twoTables1Nested1WtSameColumns,
//     expectedResult.twoColumnsWithNameAfter
//   );
//   runAdapterGetCompleters(
//     10,
//     testInputQueryContext[ContextType.Column].twoTables1Nested1Wt,
//     expectedResult.fourColumnsWith1Name
//   );
//   runAdapterGetCompleters(
//     11,
//     testInputQueryContext[ContextType.Column]
//       .twoTables1Wt1WithAlias1NestedSameColumns,
//     expectedResult.twoColumnsWithNameAndAlias
//   );
//   runAdapterGetCompleters(
//     12,
//     testInputQueryContext[ContextType.Column].twoTables1Wt1NestedWithAlias,
//     expectedResult.fourColumnsWithNameAndAlias
//   );
//   runAdapterGetCompleters(
//     13,
//     testInputQueryContext[ContextType.Column]
//       .threeTables1WtWith2Columns2NestedWith2Columns,
//     expectedResult.sixColumnsWithName1
//   );
//   runAdapterGetCompleters(
//     14,
//     testInputQueryContext[ContextType.Column]
//       .threeTables1WtWith2Columns121NestedWithColumns341NestedWithColumns34AndAlias,
//     expectedResult.sixColumnsWithNameAndAlias
//   );
//   runAdapterGetCompleters(
//     15,
//     testInputQueryContext[ContextType.Column]
//       .threeTables1WtWith2Columns121NestedWithColumns34Alias1NestedWithColumns34Alias2,
//     expectedResult.sixColumnsWithNameAnd2Alias
//   );
//   runAdapterGetCompleters(
//     16,
//     testInputQueryContext[ContextType.Column]
//       .threeTables1Ext1WtColumns121Wt2Refs,
//     expectedResult.tableRefsColumnsAndExtColumns
//   );
  runAdapterGetCompleters(
    17,
    testInputQueryContext[ContextType.Column]
      .threeTables2Ext1Wt1Refs2Columns,
    expectedResult.threeTbl1Wtwithcolumns12AndTblRef1Ext1ExtwithAlias
  );
});
