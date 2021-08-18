import { runAdapterTest } from '../../sql-context-evaluator/tests/queries-spec/utils';
import { testDbConfig } from './tests-utils';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { results } from './expected-results';

const result = results.result1;

describe('when reciving presto/sql query and a position', () => {
  runAdapterTest(
    testDbConfig,
    evaluateContextFromPosition,
    'select | from (selec col1, col2, col3 from tbl1)',
    result
  );
});
