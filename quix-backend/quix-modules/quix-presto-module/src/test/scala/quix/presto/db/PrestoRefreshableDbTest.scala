package quix.presto.db

import monix.eval.Task
import monix.execution.Scheduler
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.db.{Catalog, Kolumn, Schema, Table}
import quix.presto.TestQueryExecutor

import scala.concurrent.Await
import scala.concurrent.duration.{Duration, _}

class PrestoRefreshableDbTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new TestQueryExecutor
    val state = new DbState()
    val config = RefreshableDbConfig(1000L.millis, 1000L.millis)

    val db = new PrestoRefreshableDb(executor, config, state)

    def materialize[T](task: Task[T]): T = {
      val future = task.runToFuture(Scheduler.global)

      Await.result(future, Duration.Inf)
    }

    def getCatalogs = materialize(db.Catalogs.get)

    def getNonEfficientAutocomplete = materialize(db.Autocomplete.get)

    def getEfficientAutocomplete = materialize(db.Autocomplete.get(getCatalogs))
  }

  "RefreshableDbV2" should {
    "return table and columns" in new ctx {
      executor.withResults(List(List("uuid", "varchar")))

      val table = materialize(db.table("sunduk", "tbl", "reg_users"))

      table.name must_=== "reg_users"
      table.children must contain(Kolumn("uuid", "varchar"))
    }

    "if state.catalogs is empty, but query didn't finish in time, fallback to empty state" in new ctx {
      executor
        .withResults(List(List("test-catalog", "test-schema", "test-table")), "first-query-id", delay = 11.seconds)

      materialize(db.catalogs) must beEmpty
    }

    "if state.catalogs is empty, try inferring catalogs in single efficient query and store them" in new ctx {
      executor
        .withResults(List(List("test-catalog", "test-schema", "test-table")), "first-query-id")

      materialize(db.catalogs) must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
    }

    "calculate catalogs via single efficient query" in new ctx {
      executor
        .withResults(List(List("test-catalog", "test-schema", "test-table")), "first-query-id")

      getCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
    }

    "calculate catalogs via single efficient query, but fallback to less efficient in case of error" in new ctx {
      executor
        .withException(new Exception("failure"))
        .withResults(List(List("test-catalog")), "first-query-id")
        .withResults(List(List("test-catalog", "test-schema", "test-table")), "second-query-id")

      getCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
    }

    "calculate catalogs via efficient queries, but fallback to non-efficient in case of error" in new ctx {
      executor
        .withException(new Exception("failure"))
        .withResults(List(List("test-catalog")), "first-query-id")
        .withException(new Exception("failure"))
        .withResults(List(List("test-schema")), "second-query-id")
        .withResults(List(List("test-table")), "third-query-id")

      getCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
    }

    "fallback to empty catalog in case of failures" in new ctx {
      executor
        .withException(new Exception("failure"))
        .withResults(List(List("test-catalog")), "first-query-id")
        .withException(new Exception("failure"))
        .withException(new Exception("failure"))

      getCatalogs must contain(Catalog("test-catalog", List.empty))
    }

    "calculate autocomplete items" in new ctx {
      executor
        .withResults(List(List("catalog")))
        .withResults(List(List("schema")))
        .withResults(List(List("table")))
        .withResults(List(List("column")))

      val autocomplete = getNonEfficientAutocomplete

      autocomplete must havePair("catalogs" -> List("catalog"))
      autocomplete must havePair("schemas" -> List("schema"))
      autocomplete must havePair("tables" -> List("table"))
      autocomplete must havePair("columns" -> List("column"))
    }

    "calculate autocomplete items via efficient query" in new ctx {
      executor
        .withResults(List(List("catalog", "schema", "table")))
        .withResults(List(List("column")))

      val autocomplete = getEfficientAutocomplete

      autocomplete must havePair("catalogs" -> List("catalog"))
      autocomplete must havePair("schemas" -> List("schema"))
      autocomplete must havePair("tables" -> List("table"))
      autocomplete must havePair("columns" -> List("column"))
    }
  }

}
