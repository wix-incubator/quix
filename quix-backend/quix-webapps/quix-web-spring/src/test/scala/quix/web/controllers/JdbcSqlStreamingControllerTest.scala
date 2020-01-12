package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.ScriptResolver.classPathScript
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.hamcrest.text.MatchesPattern.matchesPattern
import org.junit.runner.RunWith
import org.junit.{After, Before, Test}
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.web.E2EContext
import quix.web.controllers.MyMatchers._
import quix.web.spring.SpringConfig

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfig]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class JdbcSqlStreamingControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(getClass).prepareTestInstance(this)

  private val prod = EmbeddedMySql.create(2222, "prod-user", "prod-pass").start()
  private val dev = EmbeddedMySql.create(3333, "dev-user", "dev-pass").start()

  @Before
  def before(): Unit = {
    prod.reloadSchema("aschema", classPathScript("db/001_init.sql"))
    dev.reloadSchema("aschema", classPathScript("db/001_init.sql"))
  }

  @After
  def after(): Unit = {
    prod.stop()
    dev.stop()
  }

  @Test(timeout = 30000)
  def queryProdShouldPassSanity(): Unit = {
    val listener = execute("select * from small_table", module = "prod")

    assertThat(listener.messagesJ, hasEvent("""{"event":"start","data":{"id":"query-id","numOfQueries":1}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-start","data":{"id":"query-id"}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-details","data":{"id":"query-id","code":"select * from small_table"}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"fields","data":{"id":"query-id","fields":["col1"]}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"row","data":{"id":"query-id","values":[1]}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-end","data":{"id":"query-id","statistics":{}}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"end","data":{"id":"query-id"}}"""))
  }

  @Test(timeout = 30000)
  def queryDevShouldPassSanity(): Unit = {
    val listener = execute("select * from small_table", module = "dev")

    assertThat(listener.messagesJ, hasEvent("""{"event":"start","data":{"id":"query-id","numOfQueries":1}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-start","data":{"id":"query-id"}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-details","data":{"id":"query-id","code":"select * from small_table"}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"fields","data":{"id":"query-id","fields":["col1"]}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"row","data":{"id":"query-id","values":[1]}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-end","data":{"id":"query-id","statistics":{}}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"end","data":{"id":"query-id"}}"""))
  }

}

object MyMatchers {
  def hasEvent(e: String) = {
    val event = e
      .replace("*", "\\*")
      .replace("[", "\\[")
      .replace("]", "\\]")
      .replace("{", "\\{")
      .replace("}", "\\}")
      .replaceAll("query-id", """.{36,37}""")

    Matchers.hasItem(matchesPattern(event))
  }
}
