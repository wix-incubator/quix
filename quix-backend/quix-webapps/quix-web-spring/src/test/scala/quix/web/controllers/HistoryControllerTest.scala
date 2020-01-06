package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.ScriptResolver.classPathScript
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.runner.RunWith
import org.junit.{After, Before, Test}
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit4.SpringRunner
import quix.web.E2EContext
import quix.web.spring.SpringConfig

import scala.collection.JavaConverters._

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfig]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class HistoryControllerTest extends E2EContext with LazyLogging {

  private val prod = EmbeddedMySql.create(2222, "prod-user", "prod-pass").start()

  @Before
  def before(): Unit = {
    prod.reloadSchema("aschema", classPathScript("db/001_init.sql"))
  }

  @After
  def after(): Unit = {
    prod.stop()
  }

  @Test(timeout = 30000)
  def listExecutionsHistory(): Unit = {
    val query = "select * from small_table"
    execute(query, module = "prod")

    val records = get[List[ExecutionDto]]("api/history/executions")

    assertThat(records.head.query.asJava, Matchers.contains(query))
  }

}
