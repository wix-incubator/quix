package quix.core.sql

import org.specs2.mutable.SpecWithJUnit

class StopWordsSplitterTest extends SpecWithJUnit {

  "StopWordSqlSplitter.split" should {
    "do not split on stop word" in {
      val splitter = new StopWordSqlSplitter("FUNCTION")

      splitter.split(
        """
          |CREATE TEMP FUNCTION FOO;
          |SELECT 1;
          |""".stripMargin) must contain(
        """
          |CREATE TEMP FUNCTION FOO;
          |SELECT 1""".stripMargin)
    }

    "split on non stop word" in {
      val splitter = new StopWordSqlSplitter("FUNCTION")

      val splits = splitter.split(
        """
          |CREATE TEMP FUNCTION FOO;
          |SELECT 1;
          |SELECT 2;
          |""".stripMargin)

      splits must contain(
        """
          |CREATE TEMP FUNCTION FOO;
          |SELECT 1""".stripMargin)

      splits must contain("SELECT 2")

    }
  }

}
