import { runAdapterTest } from '../../sql-context-evaluator/tests/queries-spec/utils';
import { testDbConfig, testTable } from './tests-utils';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { results } from './expected-results';

describe.only('when reciving presto/sql query and a position', () => {
  runAdapterTest(
    testDbConfig,
    evaluateContextFromPosition,
    'select | from (select * from tbl1)',
    results.result1
  );
});
