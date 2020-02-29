package quix.presto.db

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.db.Kolumn
import quix.presto.TestQueryExecutor

class PrestoTablesTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new TestQueryExecutor

    val tables = new PrestoTables(executor, 1000)
  }

  "PrestoTables" should {
    "return table and columns" in new ctx {
      executor.withResults(List(List("uuid", "varchar")))

      val table = tables.get("sunduk", "tbl", "reg_users").runSyncUnsafe()

      table.name must_=== "reg_users"
      table.children must contain(Kolumn("uuid", "varchar"))
    }
  }

}
