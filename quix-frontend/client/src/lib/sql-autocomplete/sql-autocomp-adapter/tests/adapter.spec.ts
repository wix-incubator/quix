import { runAdapterTest } from '../../sql-context-evaluator/tests/queries-spec/utils';
import { testDbConfig, testTable } from './tests-utils';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { results } from './expected-results';

describe('when reciving presto query and a position', () => {
  runAdapterTest(
    testDbConfig,
    evaluateContextFromPosition,
    'select | from (select col1, col2, col3 from tbl1)',
    results.result1
  );
});
