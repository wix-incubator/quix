import { ContextType } from '../../types';
import { nestedResult } from '../result-options/nested-results';
import { basicResult } from '../result-options/basic-results';
import { runQueryTest } from './utils';

describe('Presto sql context evaluator: When receiving a nested query', () => {
  describe('and the cursor is outside the nested query', () => {
    describe('after "SELECT" keyword', () => {
      runQueryTest(
        'SELECT | FROM (SELECT a, b FROM A, B)',
        nestedResult[ContextType.Column].oneNested
      );

      runQueryTest(
        'SELECT | FROM (SELECT a, b FROM A, B) tbl1',
        nestedResult[ContextType.Column].oneNestedWithAlias
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT a, b FROM A, B)',
        nestedResult[ContextType.Column].oneExtOneNested
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT a, b FROM A, B) tbl2',
        nestedResult[ContextType.Column].oneExtOneNestedWithAlias
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT * FROM A, B) tbl2',
        nestedResult[ContextType.Column].oneExtOneNestedWithAliasAndRefs
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT * FROM A, B)',
        nestedResult[ContextType.Column].oneExtOneNestedAndRefs
      );

      runQueryTest(
        'SELECT | FROM (SELECT * FROM A, B) tbl1, (SELECT a, b FROM B, C)',
        nestedResult[ContextType.Column].twoNestedOneWithRefsAndAlias
      );
    });

    describe('after "FROM" keyword', () => {
      runQueryTest(
        'SELECT * FROM (SELECT a, b FROM A, B), |',
        basicResult[ContextType.Table].zeroTables
      );

      runQueryTest(
        'SELECT * FROM (SELECT a, b FROM A, B) tbl1, |',
        basicResult[ContextType.Table].zeroTables
      );

      runQueryTest(
        'SELECT * FROM table1, (SELECT a, b FROM A, B), | ',
        basicResult[ContextType.Table].zeroTables
      );

      runQueryTest(
        'SELECT * FROM table1, (SELECT a, b FROM A, B) tbl2, |',
        basicResult[ContextType.Table].zeroTables
      );

      runQueryTest(
        'SELECT * FROM table1, (SELECT * FROM A, B), |',
        basicResult[ContextType.Table].zeroTables
      );
    });
  });

  describe('and the cursor is inside the nested query after "SELECT" keyword', () => {
    runQueryTest(
      'SELECT FROM (SELECT | FROM table1, table2)',
      basicResult[ContextType.Column].twoExternalTables
    );

    runQueryTest(
      'SELECT FROM (SELECT | FROM table1, table2) tbl1',
      basicResult[ContextType.Column].twoExternalTables
    );

    runQueryTest(
      'SELECT FROM table1, (SELECT | FROM table1, table2)',
      basicResult[ContextType.Column].twoExternalTables
    );

    runQueryTest(
      'SELECT FROM table1, (SELECT | FROM table1, table2) tbl2',
      basicResult[ContextType.Column].twoExternalTables
    );
  });

  describe('that define a column', () => {
    runQueryTest(
      'SELECT | FROM (SELECT *, (SELECT id FROM table2 WHERE table1.id = table2.id) as foo FROM table1)',
      nestedResult[ContextType.Column].oneNestedWithRefAndColumn
    );

    // TODO:  Add the functionality to get 'column' autocomplete from an external table
    //        inside a nested query that comes after SELECT keyword.
    //        In that case we expect to get two external tables -> ['table1', 'table2']

    // runQueryTest(
    //   'SELECT *, (SELECT id FROM table2 WHERE table1.id = |) as foo FROM table1',
    //   basicResult[ContextType.Column].twoExternalTables
    // );
  });

  describe('(double nested)', () => {
    describe('and the cursor is outside both nested query after "SELECT" keyword', () => {
      runQueryTest(
        'SELECT | FROM (SELECT * FROM (SELECT count(c) a, b FROM A, B))',
        nestedResult[ContextType.Column].oneNested
      );

      runQueryTest(
        'SELECT | FROM (SELECT * FROM (SELECT count(c) a, b FROM A, B)) tbl1',
        nestedResult[ContextType.Column].oneNestedWithAlias
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT * FROM (SELECT count(c) a, b FROM A, B)) tbl2',
        nestedResult[ContextType.Column].oneExtOneNestedWithAlias
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT a, b FROM (SELECT * FROM A, B)) tbl2',
        nestedResult[ContextType.Column].oneExtOneNestedWithAlias
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT * FROM (SELECT * FROM A, B)) tbl2',
        nestedResult[ContextType.Column].oneExtOneNestedWithAliasAndRefs
      );

      runQueryTest(
        'SELECT | FROM table1, (SELECT * FROM (SELECT * FROM A, B) tbl3) tbl2',
        nestedResult[ContextType.Column].oneExtOneNestedWithAliasAndRefs
      );
    });

    describe('and the cursor is inside the first nested query after "SELECT" keyword', () => {
      runQueryTest(
        'SELECT FROM (SELECT | FROM (SELECT count(c) a, b FROM A, B))',
        nestedResult[ContextType.Column].oneNested
      );

      runQueryTest(
        'SELECT FROM (SELECT | FROM (SELECT count(c) a, b FROM A, B)) tbl1',
        nestedResult[ContextType.Column].oneNested
      );

      runQueryTest(
        'SELECT FROM table1, (SELECT | FROM (SELECT count(c) a, b FROM A, B)) tbl2',
        nestedResult[ContextType.Column].oneNested
      );

      runQueryTest(
        'SELECT FROM table1, (SELECT | FROM (SELECT count(c) a, b FROM A, B) tbl1)',
        nestedResult[ContextType.Column].oneNestedWithAlias
      );

      runQueryTest(
        'SELECT FROM table1, (SELECT | FROM (SELECT * FROM A, B))',
        nestedResult[ContextType.Column].oneNestedWithRefs
      );

      runQueryTest(
        'SELECT FROM table1, (SELECT | FROM (SELECT * FROM A, B) tbl1)',
        nestedResult[ContextType.Column].oneNestedWithAliasAndRefs
      );
    });

    describe('and the cursor is inside the seconed nested query after "SELECT" keyword', () => {
      runQueryTest(
        'SELECT FROM (SELECT FROM (SELECT | FROM table1, table2))',
        basicResult[ContextType.Column].twoExternalTables
      );
    });
  });
});
