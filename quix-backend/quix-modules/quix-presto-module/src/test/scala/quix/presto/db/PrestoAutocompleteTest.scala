package quix.presto.db

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.presto.TestQueryExecutor

class PrestoAutocompleteTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new TestQueryExecutor

    val catalogs = new PrestoCatalogs(executor)
    val autocomplete = new PrestoAutocomplete(catalogs, executor)

    def fastAutocomplete = autocomplete.fast.runSyncUnsafe()

    def fullAutocomplete = autocomplete.full.runSyncUnsafe()
  }

  "PrestoAutocomplete.fast" should {

    "use catalogs.fast as a baseline for calculating of autocomplete.fast items " in new ctx {
      executor
        .withResults(List(List("catalog")))
        .withResults(List(List("column")))

      val items = fastAutocomplete

      items must havePair("catalogs" -> List("catalog"))
      items must havePair("columns" -> List("column"))
    }
  }

  "PrestoAutocomplete.full" should {

    "use catalogs.full as a baseline for calculating of autocomplete.full items " in new ctx {
      executor
        .withResults(List(List("catalog", "schema", "table")))
        .withResults(List(List("column")))

      val items = fullAutocomplete

      items must havePair("catalogs" -> List("catalog"))
      items must havePair("schemas" -> List("schema"))
      items must havePair("tables" -> List("table"))
      items must havePair("columns" -> List("column"))
    }
  }

}
