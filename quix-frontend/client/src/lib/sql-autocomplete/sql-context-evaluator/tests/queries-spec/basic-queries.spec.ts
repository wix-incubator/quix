import { ContextType } from '../../types';
import { basicResult } from '../result-options/basic-results';
import { runQueryTest } from './utils';

describe('Presto sql context evaluator: When receiving a basic query', () => {
  runQueryTest('', basicResult[ContextType.Undefined].zeroTables);
  runQueryTest(' ', basicResult[ContextType.Undefined].zeroTables);
  runQueryTest('SELECT 1', basicResult[ContextType.Undefined].zeroTables);
  runQueryTest('SE|LECT 1', basicResult[ContextType.Undefined].zeroTables);
  runQueryTest('SELECT| 1', basicResult[ContextType.Undefined].zeroTables);
  runQueryTest('SELECT 1|', basicResult[ContextType.Column].zeroTables);

  describe('and cursor after "SELECT" keyword', () => {
    runQueryTest(
      'SELECT foo,| FROM table1 WHERE foo = "value"',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT |, foo FROM table1 WHERE foo = "value"',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT |, foo FROM table1, table2 as tbl2 WHERE foo = "value"',
      basicResult[ContextType.Column].twoExternalTablesAndAlias
    );
    runQueryTest(
      'SELECT |, foo FROM table1, table2, table3 WHERE foo = "value"',
      basicResult[ContextType.Column].threeExternalTables
    );
    runQueryTest(
      'SELECT |, foo FROM (table1), table2 as tbl2 WHERE foo = "value"',
      basicResult[ContextType.Column].twoExternalTablesAndAlias
    );
    runQueryTest(
      'SELECT foo,| FROM (((table1))) WHERE foo = "value"',
      basicResult[ContextType.Column].oneExternalTable
    );
  });

  describe('and the cursor is after "FROM" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM | WHERE foo = "value"',
      basicResult[ContextType.Table].zeroTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1,| WHERE foo = "value"',
      basicResult[ContextType.Table].zeroTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1,|,table2 WHERE foo = "value"',
      basicResult[ContextType.Table].zeroTables
    );
  });

  describe('with comments in it', () => {
    runQueryTest(
      '/* comment */ SELECT foo,| FROM table1 WHERE foo = "value"',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar /* comment */ FROM | WHERE foo = "value"',
      basicResult[ContextType.Table].zeroTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1 GROUP BY | /* comment */',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 /* comment */ WHERE |',
      basicResult[ContextType.Column].twoExternalTables
    );
  });

  describe('and cursor after "GROUP BY" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 GROUP BY |',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 GROUP BY |',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 as tbl2 GROUP BY |',
      basicResult[ContextType.Column].twoExternalTablesAndAlias
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 as tbl2 GROUP |',
      basicResult[ContextType.Undefined].zeroTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 as tbl2 GROUP B|',
      basicResult[ContextType.Undefined].zeroTables
    );
  });

  describe('and cursor after "ORDER BY" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 ORDER BY |',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 ORDER BY |',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 as tbl2 ORDER BY |',
      basicResult[ContextType.Column].twoExternalTablesAndAlias
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 as tbl2 ORDER |',
      basicResult[ContextType.Undefined].zeroTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 as tbl2 ORDER B|',
      basicResult[ContextType.Undefined].zeroTables
    );
  });

  describe('and cursor after "WHERE" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 WHERE |',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE |',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=|',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
  });

  describe('and cursor after "WHERE NOT" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 WHERE NOT |',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE NOT |',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE NOT foo=|',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE NOT |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
  });

  describe('and cursor after "WHERE ... AND" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 WHERE foo=1 AND |',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 AND |',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE | AND foo=1',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 AND bar=|',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 AND |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE NOT foo=1 AND |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 AND NOT |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
  });

  describe('and cursor after "WHERE ... OR" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 WHERE foo=1 OR |',
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 OR |',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE | OR foo=1',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 OR bar=|',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 OR |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE NOT foo=1 OR |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      'SELECT foo, bar FROM table1, table2 WHERE foo=1 OR NOT |=bar',
      basicResult[ContextType.Column].twoExternalTables
    );
  });

  describe('and cursor after "HAVING" keyword', () => {
    runQueryTest(
      'SELECT foo, bar FROM table1 HAVING |',
      basicResult[ContextType.Column].oneExternalTable
    );
  });

  describe('and cursor inside function keyword', () => {
    ['MIN', 'MAX', 'COUNT', 'AVG', 'SUM'].forEach((keyword) => {
      describe(`=> ${keyword}`, () => {
        runQueryTest(
          `SELECT ${keyword}(| FROM table1`,
          basicResult[ContextType.Column].oneExternalTable
        );
        runQueryTest(
          `SELECT ${keyword}(|) FROM table1`,
          basicResult[ContextType.Column].oneExternalTable
        );
        runQueryTest(
          `SELECT ${keyword}(|, bar FROM table1`,
          basicResult[ContextType.Column].oneExternalTable
        );
        runQueryTest(
          `SELECT ${keyword}(|), bar FROM table1`,
          basicResult[ContextType.Column].oneExternalTable
        );
        runQueryTest(
          `SELECT ${keyword}(|, bar FROM table1, table2`,
          basicResult[ContextType.Column].twoExternalTables
        );
        runQueryTest(
          `SELECT ${keyword}(|), bar FROM table1, table2`,
          basicResult[ContextType.Column].twoExternalTables
        );
      });
    });
  });

  describe('and cursor inside "CASE" keyword after "SELECT" keyword', () => {
    runQueryTest(
      `SELECT foo,
          CASE
              WHEN | THEN 'something'
              ELSE 'something else'
          END AS goo
          FROM table1;`,
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      `SELECT foo,
          CASE
              WHEN bar=1 THEN |
              ELSE 'something else'
          END AS goo
          FROM table1;`,
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      `SELECT foo,
          CASE
              WHEN bar=1 THEN 'something'
              ELSE |
          END AS goo
          FROM table1;`,
      basicResult[ContextType.Column].oneExternalTable
    );
    runQueryTest(
      `SELECT foo,
          CASE
              WHEN | THEN 'something'
              ELSE 'something else'
          END AS goo
          FROM table1, table2, table3;`,
      basicResult[ContextType.Column].threeExternalTables
    );
  });

  describe('and cursor inside "CASE" keyword after "ORDER BY" keyword', () => {
    runQueryTest(
      `SELECT column1, column2
          FROM table1, table2
          ORDER BY
          (CASE
              WHEN | IS NULL THEN foo
              ELSE bar
          END);`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT column1, column2
          FROM table1, table2
          ORDER BY
          (CASE
              WHEN foo IS NULL THEN |
              ELSE bar
          END);`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT column1, column2
          FROM table1, table2
          ORDER BY
          (CASE
              WHEN foo IS NULL THEN bar
              ELSE |
          END);`,
      basicResult[ContextType.Column].twoExternalTables
    );
  });
});

