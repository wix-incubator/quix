package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.EmbeddedMysql
import com.wix.mysql.EmbeddedMysql.anEmbeddedMysql
import com.wix.mysql.ScriptResolver.classPathScript
import com.wix.mysql.config.Charset.UTF8
import com.wix.mysql.config.MysqldConfig
import com.wix.mysql.config.MysqldConfig.aMysqldConfig
import com.wix.mysql.distribution.Version.v5_6_23
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
import quix.web.spring.SpringConfig

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfig]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class JdbcSqlStreamingControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(this.getClass).prepareTestInstance(this)

  val prod = createEmbeddedMySqlServer(2222, "prod-user", "prod-pass").start()
  val dev = createEmbeddedMySqlServer(3333, "dev-user", "dev-pass").start()


  def createEmbeddedMySqlServer(port: Int, user: String, pass: String) = {
    val config: MysqldConfig = aMysqldConfig(v5_6_23)
      .withCharset(UTF8)
      .withPort(port)
      .withUser(user, pass)
      .build()

    val embeddedServer: EmbeddedMysql.Builder = anEmbeddedMysql(config)
      .addSchema("aschema", classPathScript("db/001_init.sql"))

    embeddedServer
  }

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
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-end","data":{"id":"query-id"}}"""))
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
    assertThat(listener.messagesJ, hasEvent("""{"event":"query-end","data":{"id":"query-id"}}"""))
    assertThat(listener.messagesJ, hasEvent("""{"event":"end","data":{"id":"query-id"}}"""))
  }


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
