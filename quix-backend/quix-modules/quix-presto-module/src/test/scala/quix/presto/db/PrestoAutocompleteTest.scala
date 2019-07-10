package quix.presto.db

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.db.{Catalog, Schema, Table}
import quix.presto.TestQueryExecutor

class PrestoAutocompleteTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new TestQueryExecutor

    val catalogs = new PrestoCatalogs(executor, 1000, 60 * 1000L)
    val autocomplete = new PrestoAutocomplete(catalogs, executor, 1000L, 60 * 1000L)

    def getAutocompleteItems = {
      autocomplete.get.runSyncUnsafe()
    }
  }

  "PrestoAutocomplete" should {

    "calculate autocomplete items via catalogs if present" in new ctx {
      catalogs.state = catalogs.state.copy(
        data = List(Catalog("catalog", List(Schema("schema", List(Table("table", Nil)))))),
        expirationDate = Long.MaxValue
      )
      executor.withResults(List(List("column")))

      val items = getAutocompleteItems

      items must havePair("catalogs" -> List("catalog"))
      items must havePair("schemas" -> List("schema"))
      items must havePair("tables" -> List("table"))
      items must havePair("columns" -> List("column"))
    }

    "return previous state if non-empty and execute update in background" in new ctx {
      catalogs.state = catalogs.state.copy(
        data = List(Catalog("catalog", List(Schema("schema", List(Table("table", Nil)))))),
        expirationDate = Long.MaxValue
      )

      autocomplete.state = autocomplete.state.copy(data = Map("foo" -> List.empty))

      executor.withResults(List(List("column")))

      {
        val items = getAutocompleteItems

        items must havePair("foo" -> List.empty)
      }

      eventually {
        val items = getAutocompleteItems

        items must havePair("catalogs" -> List("catalog"))
        items must havePair("schemas" -> List("schema"))
        items must havePair("tables" -> List("table"))
        items must havePair("columns" -> List("column"))

        autocomplete.state.expirationDate must beGreaterThan(0L)
      }
    }
  }

}
