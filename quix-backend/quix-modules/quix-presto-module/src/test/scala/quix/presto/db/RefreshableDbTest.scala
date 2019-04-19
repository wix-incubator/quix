package quix.presto.db

import monix.eval.Task
import monix.execution.Scheduler
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.db.{Catalog, Kolumn, Schema, Table}
import quix.presto.TestQueryExecutor

import scala.concurrent.Await
import scala.concurrent.duration.Duration

class RefreshableDbTest extends SpecWithJUnit with MustMatchers {

  "RefreshableDb.mergeNewAndOldCatalogs" should {

    "pass sanity if no change was detected" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val tables: List[Table] = List(Table("users", columns))
      val schemas: List[Schema] = List(Schema("dbo", tables))
      val newCatalogs = List(Catalog("bi", schemas))
      val oldCatalogs = List(Catalog("bi", schemas))

      val mergedResult = RefreshableDb.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== newCatalogs
    }

    "swap old catalogs with new catalogs if tables were added" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val nonEmptyTables: List[Table] = List(Table("users", columns))
      val emptyTables: List[Table] = List.empty[Table]
      val newCatalogs = List(Catalog("bi", List(Schema("dbo", nonEmptyTables))))
      val oldCatalogs = List(Catalog("bi", List(Schema("dbo", emptyTables))))

      val mergedResult = RefreshableDb.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== newCatalogs
    }

    "swap old catalogs with new catalogs if tables were removed" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val nonEmptyTables: List[Table] = List(Table("users", columns))
      val emptyTables: List[Table] = List.empty[Table]
      val newCatalogs = List(Catalog("bi", List(Schema("dbo", emptyTables))))
      val oldCatalogs = List(Catalog("bi", List(Schema("dbo", nonEmptyTables))))

      val mergedResult = RefreshableDb.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== newCatalogs
    }

    "not swap old catalogs with new catalogs if schemas were removed" in {
      val columns: List[Kolumn] = List(Kolumn("uuid", "guid"))
      val nonEmptyTables: List[Table] = List(Table("users", columns))
      val newCatalogs = List(Catalog("bi", List.empty[Schema]))
      val oldCatalogs = List(Catalog("bi", List(Schema("dbo", nonEmptyTables))))

      val mergedResult = RefreshableDb.mergeNewAndOldCatalogs(newCatalogs, oldCatalogs)

      mergedResult must_=== oldCatalogs
    }

  }

  class ctx extends Scope {
    val executor = new TestQueryExecutor
    val state = new DbState()

    val db = new RefreshableDb(executor, state)

    def materialize[T](task: Task[T]): T = {
      val future = task.runToFuture(Scheduler.global)

      Await.result(future, Duration.Inf)
    }

    def getCatalogs = materialize(db.Catalogs.get)

    def getAutocomplete = materialize(db.Autocomplete.get)
  }

  "RefreshableDbV2" should {
    "return table and columns" in new ctx {
      executor.withResults(List(List("uuid", "varchar")))

      val table = db.table("sunduk", "tbl", "reg_users")

      table.name must_=== "reg_users"
      table.children must contain(Kolumn("uuid", "varchar"))
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

      val autocomplete = getAutocomplete

      autocomplete must havePair("catalogs" -> List("catalog"))
      autocomplete must havePair("schemas" -> List("schema"))
      autocomplete must havePair("tables" -> List("table"))
      autocomplete must havePair("columns" -> List("column"))
    }
  }

}
