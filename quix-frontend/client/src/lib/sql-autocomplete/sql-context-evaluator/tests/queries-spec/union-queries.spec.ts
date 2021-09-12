import { ContextType } from '../../types';
import { basicResult } from '../result-options/basic-results';
import { nestedResult } from '../result-options/nested-results';
import { runQueryTest } from './utils';

describe('Presto sql context evaluator: When receiving "UNION" query', () => {
  describe('and cursor after "SELECT"', () => {
    runQueryTest(
      `SELECT a, b, | FROM table1
        UNION
        SELECT a, b, c FROM table2;`,
      basicResult[ContextType.Column].oneExternalTable
    );

    runQueryTest(
      `SELECT a, b, c FROM table2
        UNION
        SELECT a, b, | FROM table1;`,
      basicResult[ContextType.Column].oneExternalTable
    );

    runQueryTest(
      `SELECT FROM table2
        UNION
        SELECT a, b, | FROM table1;`,
      basicResult[ContextType.Column].oneExternalTable
    );
  });

  describe('with nested quary', () => {
    describe('And cursor after "SELECT"', () => {
      runQueryTest(
        `SELECT |
          FROM (
          SELECT a, b FROM table1
          UNION
          SELECT a, b FROM table2)`,
        nestedResult[ContextType.Column].oneNested
      );

      runQueryTest(
        `SELECT |
          FROM (
          SELECT a, b FROM table1
          UNION
          SELECT a, b FROM table2) as tbl1`,
        nestedResult[ContextType.Column].oneNestedWithAlias
      );

      runQueryTest(
        `SELECT *
          FROM (
          SELECT a, | FROM table1
          UNION
          SELECT a, b FROM table2) `,
        basicResult[ContextType.Column].oneExternalTable
      );

      runQueryTest(
        `SELECT *
          FROM (
          SELECT a, b FROM table2
          UNION
          SELECT | FROM table1)`,
        basicResult[ContextType.Column].oneExternalTable
      );

      runQueryTest(
        `SELECT |
          FROM (
          SELECT * FROM table1
          UNION
          SELECT * FROM table2)`,
        nestedResult[ContextType.Column].oneNestedWithOneRef
      );
    });
  });
});
