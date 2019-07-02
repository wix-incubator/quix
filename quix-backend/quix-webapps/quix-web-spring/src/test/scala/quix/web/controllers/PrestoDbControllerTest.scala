package quix.web.controllers

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.{Before, Test}
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.api.db.{Catalog, Kolumn, Schema, Table}
import quix.web.{E2EContext, MockBeans, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class PrestoDbControllerTest extends E2EContext {

  new TestContextManager(this.getClass).prepareTestInstance(this)
  val executor = MockBeans.queryExecutor
  val db = MockBeans.db

  @Before
  def executeBeforeEachTest = {
    executor.clear
    db.reset
  }

  @Test
  def returnEmptyCatalogsWhenPrestoIsDown(): Unit = {
    executor.withExceptions(new Exception("presto is down!"), 100)

    val catalogs = get[List[Catalog]]("api/db/presto/explore")

    assertThat(catalogs, Matchers.is(List.empty[Catalog]))
  }

  @Test
  def sendSinglePrestoQueryWhenDBTreeIsEmpty(): Unit = {
    executor.withResults(List(List("catalog", "schema", "table")))

    val catalogs = get[List[Catalog]]("api/db/presto/explore")

    val catalog = Catalog("catalog", children = List(Schema("schema", children = List(Table("table", children = Nil)))))

    assertThat(catalogs, Matchers.is(List(catalog)))
  }

  @Test
  def handleGetTableRequestWhenPrestoIsOnline(): Unit = {
    executor.withResults(List(List("column1", "varchar"), List("column2", "int")))

    val actual = get[Table]("api/db/presto/explore/catalog/schema/table")

    val expected = Table("table", List(Kolumn("column1", "varchar"), Kolumn("column2", "int")))

    assertThat(actual, Matchers.is(expected))
  }

  @Test
  def handleGetTableRequestWhenPrestoIsDown(): Unit = {
    executor.withException(new Exception("presto is down!"))

    val actual = get[Table]("api/db/presto/explore/catalog/schema/table")

    val expected = Table("table", children = Nil)

    assertThat(actual, Matchers.is(expected))
  }

  @Test
  def handleAutoCompleteRequestWhenPrestoIsOffline(): Unit = {
    executor.withExceptions(new Exception("presto is down"), 100)

    val actual = get[Map[String, List[String]]]("api/db/presto/autocomplete")

    assertThat(actual.isEmpty, Matchers.is(true))
  }

  @Test
  def handleAutoCompleteRequestWhenPrestoIsOnline(): Unit = {
    executor
      // will help building DbState.catalogs
      .withResults(List(List("catalog", "schema", "table")))
      .withResults(List(List("column1"), List("column2")))

    val actual = get[Map[String, List[String]]]("api/db/presto/autocomplete")

    assertThat(actual("catalogs"), Matchers.is(List("catalog")))
    assertThat(actual("schemas"), Matchers.is(List("schema")))
    assertThat(actual("tables"), Matchers.is(List("table")))
    assertThat(actual("columns"), Matchers.is(List("column1", "column2")))
  }

  @Test
  def handleAutoCompleteRequestWhenPrestoIsOnlineAndThenOffline(): Unit = {
    executor
      // will help building DbState.catalogs
      .withResults(List(List("catalog", "schema", "table")))
      .withResults(List(List("column1"), List("column2")))
      .withExceptions(new Exception("presto is down!"), 100)

    // first request goes to presto
    {
      val actual = get[Map[String, List[String]]]("api/db/presto/autocomplete")

      assertThat(actual("catalogs"), Matchers.is(List("catalog")))
      assertThat(actual("schemas"), Matchers.is(List("schema")))
      assertThat(actual("tables"), Matchers.is(List("table")))
      assertThat(actual("columns"), Matchers.is(List("column1", "column2")))
    }

    // second request from cache
    {
      val actual = get[Map[String, List[String]]]("api/db/presto/autocomplete")

      assertThat(actual("catalogs"), Matchers.is(List("catalog")))
      assertThat(actual("schemas"), Matchers.is(List("schema")))
      assertThat(actual("tables"), Matchers.is(List("table")))
      assertThat(actual("columns"), Matchers.is(List("column1", "column2")))
    }
  }
}


