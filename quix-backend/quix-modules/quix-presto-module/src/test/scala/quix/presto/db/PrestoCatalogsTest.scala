package quix.presto.db

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.db.{Catalog, Schema, Table}
import quix.presto.TestQueryExecutor

import scala.concurrent.duration._

class PrestoCatalogsTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new TestQueryExecutor

    val catalogs = new PrestoCatalogs(executor, 1000, 60 * 1000L)

    def getCatalogs = {
      catalogs.get.runSyncUnsafe()
    }
  }

  "PrestoCatalogs with empty state" should {
    "if state.catalogs is empty, should fire fast 'show catalogs' query and trigger background update" in new ctx {
      executor
        .withResults(List(List("test-catalog")))
        .withResults(List(List("test-catalog", "test-schema", "test-table")))

      getCatalogs must contain(Catalog("test-catalog", Nil))

      eventually {
        getCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
      }
    }

    "if state.catalogs is empty, but query didn't finish in time, fallback to empty state" in new ctx {
      executor
        .withResults(List(List("test-catalog")), "first-query-id", delay = 11.seconds)
        .withException(new Exception("boom!"))

      getCatalogs must beEmpty
    }

    "if state.catalogs is empty, and presto is down, fallback to empty list" in new ctx {
      executor
        .withExceptions(new Exception("boom!"), 100)

      getCatalogs must beEmpty
    }

    "if state.catalogs is empty, result of fast query should be memoized" in new ctx {
      executor
        .withResults(List(List("test-catalog")))
        .withExceptions(new Exception("boom!"), 1000)

      getCatalogs must contain(Catalog("test-catalog", Nil))
    }
  }

  "PrestoCatalogs with non empty stale state" should {
    "return last known state and calculate catalogs via single efficient query with fallback to less efficient in case of error" in new ctx {
      catalogs.state = catalogs.state.copy(data = List(Catalog("foo", children = Nil)))

      executor
        .withException(new Exception("failure"))
        .withResults(List(List("test-catalog")), "first-query-id")
        .withResults(List(List("test-catalog", "test-schema", "test-table")), "second-query-id")

      getCatalogs must contain(Catalog("foo", Nil))

      eventually {
        getCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
      }

    }

    "calculate catalogs via efficient queries, but fallback to non-efficient in case of error" in new ctx {
      catalogs.state = catalogs.state.copy(data = List(Catalog("foo", children = Nil)))

      executor
        .withException(new Exception("failure"))
        .withResults(List(List("test-catalog")), "first-query-id")
        .withException(new Exception("failure"))
        .withResults(List(List("test-schema")), "second-query-id")
        .withResults(List(List("test-table")), "third-query-id")

      getCatalogs must contain(Catalog("foo", Nil))

      eventually {
        getCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
      }
    }

    "fallback to empty catalog in case of failures" in new ctx {
      catalogs.state = catalogs.state.copy(data = List(Catalog("foo", children = Nil)))

      executor
        .withException(new Exception("failure"))
        .withResults(List(List("test-catalog")), "first-query-id")
        .withException(new Exception("failure"))
        .withException(new Exception("failure"))

      getCatalogs must contain(Catalog("foo", Nil))

      eventually {
        getCatalogs must contain(Catalog("test-catalog", List.empty))
      }
    }
  }

}
