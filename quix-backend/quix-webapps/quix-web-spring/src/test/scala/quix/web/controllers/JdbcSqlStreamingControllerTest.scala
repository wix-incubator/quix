package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import com.wix.mysql.EmbeddedMysql
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.runner.RunWith
import org.junit.{After, Before, Test}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.web.{E2EContext, JdbTestSpringConfig}


@RunWith(classOf[SpringRunner])
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[JdbTestSpringConfig],classOf[JdbTestSpringConfig]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class JdbcSqlStreamingControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(this.getClass).prepareTestInstance(this)


  @Autowired
  var startTestServer: EmbeddedMysql = _

  @After
  def after() :Unit = {
    startTestServer.stop()
  }

  @Test (timeout=30000)
  def passSanity(): Unit = {
//    executor.withResults(List(List("1")), columns = List("_col0"))
    val listener = execute("select * from t1" , webSocketModuleSuffix = "jdbc")

    assertThat(listener.messagesJ.get(0), Matchers.startsWith( """{"event":"start"""))
//    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-details","data":{"id":"query-id","code":"select 1"}}"""))
//    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-id","percentage":0}}"""))
//    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"fields","data":{"id":"query-id","fields":["_col0"]}}"""))
//    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"row","data":{"id":"query-id","values":["1"]}}"""))
//    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-id","percentage":100}}"""))
//    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-end","data":{"id":"query-id"}}"""))
  }


}
