import { ContextType } from '../../types';
import { basicResult } from '../result-options/basic-results';
import { runQueryTest } from './utils';

describe('Presto sql context evaluator: When receiving "JOIN" query', () => {
  describe('and cursor after "SELECT"', () => {
    runQueryTest(
      `SELECT |
        FROM table1
        INNER JOIN table2 ON table1.uuid=table2.uuid;`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT table1.OrderID, |
        FROM (table1
        INNER JOIN table2 ON table1.CustomerID = table2.CustomerID
        INNER JOIN table3 ON table1.ShipperID = table3.ShipperID);`,
      basicResult[ContextType.Column].threeExternalTables
    );
    runQueryTest(
      `SELECT table1.OrderID, |
        FROM ((table1
        INNER JOIN table2 ON table1.CustomerID = table2.CustomerID)
        INNER JOIN table3 ON table1.ShipperID = table3.ShipperID);`,
      basicResult[ContextType.Column].threeExternalTables
    );
  });

  describe('and cursor after "ON"', () => {
    runQueryTest(
      `SELECT table1.a, table2.b
        FROM table1
        INNER JOIN table2 ON |;`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT table1.a, table2.b
        FROM table1
        INNER JOIN table2 ON table1.uuid=|;`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT table1.a, table2.b
        FROM table1
        INNER JOIN table2 ON |=table2.uuid;`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT table1.a, table2.b, table3.c
        FROM ((table1
        INNER JOIN table2 ON table1.CustomerID = table2.CustomerID)
        INNER JOIN table3 ON |);`,
      basicResult[ContextType.Column].threeExternalTables
    );
  });

  describe('and cursor after "USING"', () => {
    /*
     * TODO : if the cursor after "USING" the correct result is only the columns that appear in both tables.
     */

    runQueryTest(
      `SELECT table1.a, table2.b
        FROM table1
        INNER JOIN table2 USING (|;`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT table1.a, table2.b
        FROM table1
        INNER JOIN table2 USING (|);`,
      basicResult[ContextType.Column].twoExternalTables
    );
    runQueryTest(
      `SELECT table1.a, table2.b, table3.c
        FROM ((table1
        INNER JOIN table2 USING (CustomerID))
        INNER JOIN table3 USING (|));`,
      basicResult[ContextType.Column].threeExternalTables
    );
  });

  describe('and cursor after "JOIN"', () => {
    runQueryTest(
      `SELECT table1.a, table1.b
        FROM table1
        INNER JOIN |`,
      basicResult[ContextType.Table].zeroTables
    );
    runQueryTest(
      `SELECT table1.a, table2.b
        FROM ((table1
        INNER JOIN table2 ON table1.CustomerID = table2.CustomerID)
        INNER JOIN |`,
      basicResult[ContextType.Table].zeroTables
    );
  });

  describe('while typing "JOIN"', () => {
    runQueryTest(
      `SELECT table1.a, table1.b
        FROM table1
        INNER |`,
      basicResult[ContextType.Keywords].zeroTables
    );
    runQueryTest(
      `SELECT table1.a, table1.b
        FROM table1
        LEFT |`,
      basicResult[ContextType.Keywords].zeroTables
    );
    runQueryTest(
      `SELECT table1.a, table1.b
        FROM table1
        RIGHT |`,
      basicResult[ContextType.Keywords].zeroTables
    );
    runQueryTest(
      `SELECT table1.a, table1.b
        FROM table1
        OUTER |`,
      basicResult[ContextType.Keywords].zeroTables
    );
    runQueryTest(
      `SELECT table1.a, table1.b
        FROM table1
        INNER JOI|`,
      basicResult[ContextType.Keywords].zeroTables
    );
  });

});
