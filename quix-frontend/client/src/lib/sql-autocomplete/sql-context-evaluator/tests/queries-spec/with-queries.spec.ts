import { ContextType, TableType } from '../../types';
import { runQueryTest } from './utils';
import { withResult } from '../result-options/with-results';
import { basicResult } from '../result-options/basic-results';
import { nestedResult } from '../result-options/nested-results';

describe('Presto sql context evaluator: When receiving "WITH" query', () => {
  describe('and cursor outside the "WITH"', () => {
    describe('after "SELECT" keyword', () => {
      runQueryTest(
        'WITH table1(foo1, bar1) as (SELECT a, b FROM users) SELECT | FROM table1',
        withResult[ContextType.Column].oneWithTable
      );

      runQueryTest(
        'WITH table1 as (SELECT foo1, bar1 FROM users) SELECT | FROM table1',
        withResult[ContextType.Column].oneWithTable
      );

      runQueryTest(
        'WITH table1 as (SELECT foo1, bar1 FROM users) SELECT | FROM table1 as tbl1',
        withResult[ContextType.Column].oneWithTableAliased
      );

      runQueryTest(
        'WITH table1 as (SELECT * FROM externalTable) SELECT | FROM table1',
        withResult[ContextType.Column].oneWithTableAndRef
      );

      runQueryTest(
        'WITH table1 as (SELECT foo1, bar1 FROM users) SELECT | FROM table1, table2',
        withResult[ContextType.Column].oneWithOneExternalTables
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
                  table2 as (SELECT foo2, bar2 FROM products)
              SELECT | FROM table1, table2`,
        withResult[ContextType.Column].twoWithTables
      );

      describe('(nested query)', () => {
        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT * FROM externalTable))
                SELECT | FROM table1`,
          withResult[ContextType.Column].oneWithTableAndRef
        );

        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT foo1, bar1 FROM externalTable))
                SELECT | FROM table1`,
          withResult[ContextType.Column].oneWithTable
        );

        runQueryTest(
          `WITH table2 as (SELECT * FROM externalTable),
              table1 as (SELECT * FROM table2)
              SELECT | FROM table1`,
          withResult[ContextType.Column].oneWithTableWithNameAndOneRef
        );

        runQueryTest(
          `WITH table2 as (SELECT * FROM externalTable),
              table3 as (SELECT * FROM table2),
              table1 as (SELECT * FROM table3)
              SELECT | FROM table1`,
          withResult[ContextType.Column].oneWithTableAndRef
        );
      });
    });

    describe('after "FROM" keyword', () => {
      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users)
              SELECT foo1 FROM |`,
        withResult[ContextType.Table].oneWithTable
      );

      runQueryTest(
        `WITH table1 as (SELECT * FROM externalTable)
              SELECT foo FROM |`,
        withResult[ContextType.Table].oneWithTableAndRef
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
                  table2(foo2, bar2) as (SELECT c, d FROM products)
              SELECT foo1, b FROM |`,
        withResult[ContextType.Table].twoWithTables
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
                  table2(foo2, bar2) as (SELECT c, d FROM products)
              SELECT foo1, b FROM table3, |`,
        withResult[ContextType.Table].twoWithTables
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
                  table2(foo2, bar2) as (SELECT c, d FROM products)
              SELECT foo1, b FROM |, table3`,
        withResult[ContextType.Table].twoWithTables
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
                  table2(foo2, bar2) as (SELECT c, d FROM products)
              SELECT foo1, b FROM table3, |, table4`,
        withResult[ContextType.Table].twoWithTables
      );

      describe('(nested query)', () => {
        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT * FROM externalTable))
                SELECT a FROM |`,
          withResult[ContextType.Table].oneWithTableAndRef
        );

        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT foo1, bar1 FROM externalTable))
                SELECT a FROM |`,
          withResult[ContextType.Table].oneWithTable
        );
      });
    });
  });

  describe('and cursor inside the "WITH"', () => {
    describe('after "SELECT" keyword', () => {
      runQueryTest(
        `WITH table2 as (SELECT foo1, | FROM table1)
              SELECT foo1 FROM table2`,
        basicResult[ContextType.Column].oneExternalTable
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
            table2(foo2, bar2) as (SELECT | FROM table1)
              SELECT foo1 FROM table1`,
        withResult[ContextType.Column].oneWithTable
      );

      runQueryTest(
        `WITH table2 as (SELECT foo1, bar1 FROM users),
            table3(foo2, bar2) as (SELECT | FROM table1)
              SELECT foo1 FROM table2`,
        basicResult[ContextType.Column].oneExternalTable
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
            table3(foo2, bar2) as (SELECT | FROM table1, table2)
              SELECT foo1 FROM table3`,
        withResult[ContextType.Column].oneWithOneExternalTables
      );

      describe('(nested query)', () => {
        runQueryTest(
          `WITH table2 as (SELECT * FROM (SELECT * FROM  table1)),
            table3(foo3, bar3) as (SELECT | FROM (SELECT * FROM table2))
              SELECT foo1 FROM table3`,
          nestedResult[ContextType.Column].oneNestedWithOneRef
        );

        runQueryTest(
          `WITH table2 as (SELECT * FROM (SELECT a, b FROM  table1)),
            table3(foo3, bar3) as (SELECT | FROM (SELECT * FROM table2))
              SELECT foo1 FROM table3`,
          nestedResult[ContextType.Column].oneNested
        );
      });
    });

    describe('after "FROM" keyword', () => {
      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM |)
              SELECT foo1 FROM table1`,
        basicResult[ContextType.Table].zeroTables
      );

      runQueryTest(
        `WITH table1 as (SELECT foo1, bar1 FROM users),
            table2(foo2, bar2) as (SELECT c, d FROM |)
              SELECT foo1 FROM table1`,
        withResult[ContextType.Table].oneWithTable
      );

      describe('(nested query)', () => {
        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT * FROM externalTable)),
            table2(foo2, bar2) as (SELECT c, d FROM |)
              SELECT foo1 FROM table1`,
          withResult[ContextType.Table].oneWithTableAndRef
        );

        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT foo1, bar1 FROM users)),
            table2(foo2, bar2) as (SELECT c, d FROM |)
              SELECT foo1 FROM table1`,
          withResult[ContextType.Table].oneWithTable
        );

        runQueryTest(
          `WITH table1 as (SELECT * FROM (SELECT foo1, bar1 FROM users)),
            table2(foo2, bar2) as (SELECT c, d FROM |)
              SELECT foo1 FROM table1`,
          withResult[ContextType.Table].oneWithTable
        );
      });
    });
  });
});
