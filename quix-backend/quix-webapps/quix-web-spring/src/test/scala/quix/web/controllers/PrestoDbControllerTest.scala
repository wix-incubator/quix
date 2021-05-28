package quix.web.controllers

import quix.api.v1.db.{Catalog, Kolumn, Schema, Table}
import quix.core.db.State
import quix.web.{E2EContext, MockBeans}

class PrestoDbControllerTest extends E2EContext {
  sequential

  val executor = MockBeans.queryExecutor
  val db = MockBeans.db
  val prestoCatalogs = MockBeans.refreshableCatalogs

  override def before = {
    executor.clear
    MockBeans.refreshableAutocomplete.state = State(Map.empty, 0L)
    MockBeans.refreshableCatalogs.state = State(List.empty, 0L)
  }

  "PrestoDbController" should {
    "returnEmptyCatalogsWhenPrestoIsDown" in {
      executor.withExceptions(new Exception("presto is down!"), 100)

      val catalogs = get[List[Catalog]]("api/db/presto-prod/explore")

      catalogs must beEmpty
    }

    "sendFastPrestoQueryWhenDBTreeIsEmptyAndSlowInBackground" in {
      executor
        .withResults(List(List("catalog1")))
        .withResults(List(List("catalog1", "schema", "table")))

      val catalogs = get[List[Catalog]]("api/db/presto-prod/explore")
      val resultOfFastQuery = Catalog("catalog1", children = Nil)

      catalogs must_=== List(resultOfFastQuery)
    }

    "returnEmptyListForNonMatchingQuery" in {
      executor.withResults(List(List("catalog", "schema", "table")))

      val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=foo")

      catalogs must beEmpty
    }

    "searchByTableName" in {
      val catalog = Catalog("catalog", children = List(Schema("schema", children = List(Table("table", Nil)))))
      prestoCatalogs.state = prestoCatalogs.state.copy(data = List(catalog), expirationDate = Long.MaxValue)

      val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=table")

      catalogs must_=== List(catalog)
    }

    "searchBySchemaName" in {
      val catalog = Catalog("catalog", children = List(Schema("schema", children = Nil)))
      prestoCatalogs.state = prestoCatalogs.state.copy(data = List(catalog), expirationDate = Long.MaxValue)

      val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=schema")

      catalogs must_=== List(catalog)
    }

    "searchByCatalogName" in {
      executor
        .withResults(List(List("catalog")))
        .withResults(List(List("catalog", "schema", "table")))

      val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=catalog")

      val catalog = Catalog("catalog", children = Nil)

      catalogs must_=== List(catalog)
    }

    "handleGetTableRequestWhenPrestoIsOnline" in {
      executor.withResults(List(List("column1", "varchar"), List("column2", "int")))

      val actual = get[Table]("api/db/presto-prod/explore/catalog/schema/table")

      val expected = Table("table", List(Kolumn("column1", "varchar"), Kolumn("column2", "int")))

      actual must_=== expected
    }

    "handleGetTableRequestWhenPrestoIsDown" in {
      executor.withException(new Exception("presto is down!"))

      val actual = get[Table]("api/db/presto-prod/explore/catalog/schema/table")

      val expected = Table("table", children = Nil)

      actual must_=== expected
    }

    "handleAutoCompleteRequestWhenPrestoIsOffline" in {
      executor.withExceptions(new Exception("presto is down"), 100)

      val actual = get[Map[String, List[String]]]("api/db/presto-prod/autocomplete")

      actual("catalogs") must beEmpty
      actual("schemas") must beEmpty
      actual("tables") must beEmpty
      actual("columns") must beEmpty
    }

    "handleAutoCompleteRequestWhenAutocompleteStateIsEmpty" in {
      executor
        .withResults(List(List("catalog1"), List("catalog2")))
        .withResults(List(List("column1"), List("column2")))

      val actual = get[Map[String, List[String]]]("api/db/presto-prod/autocomplete")

      actual("catalogs") must_=== List("catalog1", "catalog2")
      actual("columns") must_=== List("column1", "column2")
    }

    "handleAutoCompleteRequestWhenAutocompleteStateExists" in {
      MockBeans.refreshableAutocomplete.state = State(Map("foo" -> List("boo")), Long.MaxValue)

      executor.withException(new Exception("boom!"))
      val actual = get[Map[String, List[String]]]("api/db/presto-prod/autocomplete")

      actual("foo") must_=== List("boo")
    }

    "returnListOfSchemasOnCorrectCatalogName" in {
      val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
      MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

      val firstResults = get[List[Schema]]("api/db/presto-prod/explore/catalog")
      firstResults must_=== mock.children
    }

    "returnEmptyListOfSchemasOnInvalidCatalogName" in {
      val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
      MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

      val firstResults = get[List[Schema]]("api/db/presto-prod/explore/i-do-not-exist")
      firstResults must beEmpty
    }

    "returnListOfTablesOnCorrectCatalogNameAndSchemaName" in {
      val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
      MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

      val firstResults = get[List[Table]]("api/db/presto-prod/explore/catalog/second")
      firstResults must_=== List(Table("first", Nil))
    }

    "returnEmptyListOfTablesOnInvalidCatalogNameOrSchemaName" in {
      val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
      MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

      val results = get[List[Table]]("api/db/presto-prod/explore/catalog/foo")
      results must beEmpty
    }
  }
}


