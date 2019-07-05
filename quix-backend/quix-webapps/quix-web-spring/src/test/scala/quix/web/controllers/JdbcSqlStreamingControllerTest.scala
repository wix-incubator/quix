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
import org.junit.runner.RunWith
import org.junit.{After, Before, Test}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.web.{E2EContext, JdbTestSpringConfig, MockBeans}


@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[JdbTestSpringConfig]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class JdbcSqlStreamingControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(this.getClass).prepareTestInstance(this)
  val executor = MockBeans.queryExecutor

  var startTestServer: EmbeddedMysql = _

  val server = createEmbeddedMySqlServer()



  def createEmbeddedMySqlServer() = {
    val config: MysqldConfig = aMysqldConfig(v5_6_23)
      .withCharset(UTF8)
      .withPort(2215)
      .withUser("wix", "wix")
      .build()

    val embeddedServer: EmbeddedMysql.Builder = anEmbeddedMysql(config)
      .addSchema("aschema", classPathScript("db/001_init.sql"))
    embeddedServer
  }

  @Before
  def before() : Unit = {
    executor.clear
    startTestServer = server.start()
  }

  @After
  def after() :Unit = {
    startTestServer.stop()
  }

  @Test (timeout=30000)
  def passSanity(): Unit = {
    executor
      .withResults(List(List("1")), queryId = "query-id", columns = List("foo"))

    val listener = execute("select * from t1" , webSocketModuleSuffix = "jdbc")

    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-start","data":{"id":"query-id"}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-details","data":{"id":"query-id","code":"select * from t1"}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-end","data":{"id":"query-id"}}"""))


  }


}
