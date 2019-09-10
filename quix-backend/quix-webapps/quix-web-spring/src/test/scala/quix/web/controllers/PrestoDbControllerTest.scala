package quix.web.controllers

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.runner.RunWith
import org.junit.{Before, Test}
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.api.db.{Catalog, Kolumn, Schema, Table}
import quix.core.db.State
import quix.web.{E2EContext, MockBeans, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class PrestoDbControllerTest extends E2EContext {

  new TestContextManager(this.getClass).prepareTestInstance(this)
  val executor = MockBeans.queryExecutor
  val db = MockBeans.db
  val prestoCatalogs = MockBeans.refreshableCatalogs

  @Before
  def executeBeforeEachTest = {
    executor.clear
    MockBeans.refreshableAutocomplete.state = State(Map.empty, 0L)
    MockBeans.refreshableCatalogs.state = State(List.empty, 0L)
  }

  @Test
  def returnEmptyCatalogsWhenPrestoIsDown(): Unit = {
    executor.withExceptions(new Exception("presto is down!"), 100)

    val catalogs = get[List[Catalog]]("api/db/presto-prod/explore")

    assertThat(catalogs, Matchers.is(List.empty[Catalog]))
  }

  @Test
  def sendFastPrestoQueryWhenDBTreeIsEmptyAndSlowInBackground(): Unit = {
    executor
      .withResults(List(List("catalog1")))
      .withResults(List(List("catalog1", "schema", "table")))

    val catalogs = get[List[Catalog]]("api/db/presto-prod/explore")
    val resultOfFastQuery = Catalog("catalog1", children = Nil)
    assertThat(catalogs, Matchers.is(List(resultOfFastQuery)))

  }

  @Test
  def returnEmptyListForNonMatchingQuery(): Unit = {
    executor.withResults(List(List("catalog", "schema", "table")))

    val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=foo")

    assertThat(catalogs, Matchers.is(List.empty[Catalog]))
  }

  @Test
  def searchByTableName(): Unit = {
    val catalog = Catalog("catalog", children = List(Schema("schema", children = List(Table("table", Nil)))))
    prestoCatalogs.state = prestoCatalogs.state.copy(data = List(catalog), expirationDate = Long.MaxValue)

    val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=table")

    assertThat(catalogs, Matchers.is(List(catalog)))
  }

  @Test
  def searchBySchemaName(): Unit = {
    val catalog = Catalog("catalog", children = List(Schema("schema", children = Nil)))
    prestoCatalogs.state = prestoCatalogs.state.copy(data = List(catalog), expirationDate = Long.MaxValue)

    val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=schema")

    assertThat(catalogs, Matchers.is(List(catalog)))
  }

  @Test
  def searchByCatalogName(): Unit = {
    executor
      .withResults(List(List("catalog")))
      .withResults(List(List("catalog", "schema", "table")))

    val catalogs = get[List[Catalog]]("api/db/presto-prod/search?q=catalog")

    val catalog = Catalog("catalog", children = Nil)

    assertThat(catalogs, Matchers.is(List(catalog)))
  }

  @Test
  def handleGetTableRequestWhenPrestoIsOnline(): Unit = {
    executor.withResults(List(List("column1", "varchar"), List("column2", "int")))

    val actual = get[Table]("api/db/presto-prod/explore/catalog/schema/table")

    val expected = Table("table", List(Kolumn("column1", "varchar"), Kolumn("column2", "int")))

    assertThat(actual, Matchers.is(expected))
  }

  @Test
  def handleGetTableRequestWhenPrestoIsDown(): Unit = {
    executor.withException(new Exception("presto is down!"))

    val actual = get[Table]("api/db/presto-prod/explore/catalog/schema/table")

    val expected = Table("table", children = Nil)

    assertThat(actual, Matchers.is(expected))
  }

  @Test
  def handleAutoCompleteRequestWhenPrestoIsOffline(): Unit = {
    executor.withExceptions(new Exception("presto is down"), 100)

    val actual = get[Map[String, List[String]]]("api/db/presto-prod/autocomplete")

    assertThat(actual("catalogs").isEmpty, Matchers.is(true))
    assertThat(actual("schemas").isEmpty, Matchers.is(true))
    assertThat(actual("tables").isEmpty, Matchers.is(true))
    assertThat(actual("columns").isEmpty, Matchers.is(true))
  }

  @Test
  def handleAutoCompleteRequestWhenAutocompleteStateIsEmpty(): Unit = {
    executor
      .withResults(List(List("catalog1"), List("catalog2")))
      .withResults(List(List("column1"), List("column2")))

    val actual = get[Map[String, List[String]]]("api/db/presto-prod/autocomplete")

    assertThat(actual("catalogs"), Matchers.is(List("catalog1", "catalog2")))
    assertThat(actual("columns"), Matchers.is(List("column1", "column2")))
  }

  @Test
  def handleAutoCompleteRequestWhenAutocompleteStateExists(): Unit = {
    MockBeans.refreshableAutocomplete.state = State(Map("foo" -> List("boo")), Long.MaxValue)

    executor.withException(new Exception("boom!"))
    val actual = get[Map[String, List[String]]]("api/db/presto-prod/autocomplete")

    assertThat(actual("foo"), Matchers.is(List("boo")))
  }

  @Test
  def returnListOfSchemasOnCorrectCatalogName(): Unit = {
    val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
    MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

    val firstResults = get[List[Schema]]("api/db/presto-prod/explore/catalog")
    assertThat(firstResults, Matchers.is(mock.children))
  }

  @Test
  def returnEmptyListOfSchemasOnInvalidCatalogName(): Unit = {
    val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
    MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

    val firstResults = get[List[Schema]]("api/db/presto-prod/explore/i-do-not-exist")
    assertThat(firstResults, Matchers.is(List.empty[Schema]))
  }

  @Test
  def returnListOfTablesOnCorrectCatalogNameAndSchemaName(): Unit = {
    val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
    MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

    val firstResults = get[List[Table]]("api/db/presto-prod/explore/catalog/second")
    assertThat(firstResults, Matchers.is(List(Table("first", Nil))))
  }

  @Test
  def returnEmptyListOfTablesOnInvalidCatalogNameOrSchemaName(): Unit = {
    val mock = Catalog("catalog", children = List(Schema("first", Nil), Schema("second", List(Table("first", Nil)))))
    MockBeans.refreshableCatalogs.state = State(List(mock), System.currentTimeMillis() + 1000 * 10)

    val results = get[List[Table]]("api/db/presto-prod/explore/catalog/foo")
    assertThat(results, Matchers.is(List.empty[Table]))
  }
}


