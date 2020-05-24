package quix.presto.db

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.db.{Catalog, Schema, Table}
import quix.presto.TestQueryExecutor

class PrestoCatalogsTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new TestQueryExecutor

    val catalogs = new PrestoCatalogs(executor)

    def fastCatalogs = {
      catalogs.fast.runSyncUnsafe()
    }

    def fullCatalogs = {
      catalogs.full.runSyncUnsafe()
    }
  }

  "PrestoCatalogs.fast" should {
    "return only catalog names" in new ctx {
      executor.withResults(List(List("test-catalog")))

      fastCatalogs must contain(Catalog("test-catalog", Nil))
    }

    "fallback to empty list if presto is down" in new ctx {
      executor
        .withExceptions(new Exception("boom!"), 100)

      fastCatalogs must beEmpty
    }
  }

  "PrestoCatalogs.full" should {
    "return full catalogs tree if presto is live" in new ctx {
      executor
        .withResults(List(List("test-catalog")))
        .withResults(List(List("test-catalog", "test-schema", "test-table")))

      fullCatalogs must contain(Catalog("test-catalog", List(Schema("test-schema", List(Table("test-table", List.empty))))))
    }

    "fallback to empty list if presto is down" in new ctx {
      executor.withExceptions(new Exception("boom!"), 100)

      fullCatalogs must beEmpty
    }
  }

}
