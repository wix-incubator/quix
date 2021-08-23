import { runAdapterTest } from './tests-utils';
import { testDbConfig } from './tests-utils';
import { evaluateContextFromPosition } from '../../sql-context-evaluator';
import { results } from './expected-results';

describe('when reciving presto query and a position', () => {
  describe('with nested query', () => {
    describe('And cursor after select', () => {
      runAdapterTest(
        testDbConfig,
        evaluateContextFromPosition,
        'select | from (select * from prod.adi.adi_bots_black_list)',
        results.adi_bots_black_list
      );
    });
  });
});
