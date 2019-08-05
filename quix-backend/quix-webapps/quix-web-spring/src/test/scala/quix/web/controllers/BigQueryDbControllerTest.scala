package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.runner.RunWith
import org.junit.{Before, Test}
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.api.db.Catalog
import quix.core.db.State
import quix.web.{BigQueryMockBeans, E2EContext, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class BigQueryDbControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(this.getClass).prepareTestInstance(this)
  val executor = BigQueryMockBeans.bigQueryQueryExecutor
  val db = BigQueryMockBeans.bigQueryDb
  val catalogs = BigQueryMockBeans.bigQueryRefreshableCatalogs

  @Before
  def executeBeforeEachTest = {
    executor.clear
    BigQueryMockBeans.bigQueryRefreshableAutocomplete.state = State(Map.empty, 0L)
    BigQueryMockBeans.bigQueryRefreshableCatalogs.state = State(List.empty, 0L)
  }

  @Test
  def returnEmptyCatalogsWhenBigQueryIsDown(): Unit = {
    executor.withExceptions(new Exception("bigquery is down!"), 100)

    val catalogs = get[List[Catalog]]("api/db/bigquery-prod/explore")

    assertThat(catalogs, Matchers.is(List(Catalog("__root", List.empty))))
  }

/*  @Test
  def sendFastBigQueryQueryWhenDBTreeIsEmptyAndSlowInBackground(): Unit = {
    executor
      .withResults(List(List("catalog1")))
      .withResults(List(List("catalog1", "schema", "table")))

    val catalogs = get[List[Catalog]]("api/db/bigquery-prod/explore")
    assertThat(catalogs, Matchers.is(List(
      Catalog("__root", List.empty),
      Catalog("catalog1", children = Nil)
    )))
  }*/

  //TODO more test! like in presto
}
