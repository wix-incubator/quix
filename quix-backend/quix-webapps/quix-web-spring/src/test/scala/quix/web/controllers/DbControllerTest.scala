package quix.web.controllers

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.api.db.{Catalog, Kolumn, Schema, Table}
import quix.web.{E2EContext, SpringConfigWithTestExecutor, TestQueryExecutorInstance}

@RunWith(classOf[SpringRunner])
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class DbControllerTest extends E2EContext {

  new TestContextManager(this.getClass).prepareTestInstance(this)
  val executor = TestQueryExecutorInstance.instance

  @Test
  def returnEmptyCatalogsWhenPrestoIsDown(): Unit = {
    executor.clear.withExceptions(new Exception("presto is down!"), 100)

    val catalogs = get[List[Catalog]]("api/db/explore")

    assertThat(catalogs, Matchers.is(List.empty[Catalog]))
  }

  @Test
  def sendSinglePrestoQueryWhenDBTreeIsEmpty(): Unit = {
    executor.clear.withResults(List(List("catalog", "schema", "table")))

    val catalogs = get[List[Catalog]]("api/db/explore")

    val catalog = Catalog("catalog", children = List(Schema("schema", children = List(Table("table", children = Nil)))))

    assertThat(catalogs, Matchers.is(List(catalog)))
  }

  @Test
  def handleGetTableRequestWhenPrestoIsOnline(): Unit = {
    executor.clear.withResults(List(List("column1", "varchar"), List("column2", "int")))

    val actual = get[Table]("api/db/explore/catalog/schema/table")

    val expected = Table("table", List(Kolumn("column1", "varchar"), Kolumn("column2", "int")))

    assertThat(actual, Matchers.is(expected))
  }

  @Test
  def handleGetTableRequestWhenPrestoIsDown(): Unit = {
    executor.clear.withException(new Exception("presto is down!"))

    val actual = get[Table]("api/db/explore/catalog/schema/table")

    val expected = Table("table", children = Nil)

    assertThat(actual, Matchers.is(expected))
  }
}


