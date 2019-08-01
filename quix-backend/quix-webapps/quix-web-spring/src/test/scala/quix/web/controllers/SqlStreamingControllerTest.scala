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
import quix.web.{E2EContext, MockBeans, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class SqlStreamingControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(this.getClass).prepareTestInstance(this)

  val executor = MockBeans.queryExecutor

  @Before
  def executeBeforeEachTest(): Unit = executor.clear

  @Test
  def passSanity(): Unit = {
    executor.withResults(List(List("1")), columns = List("_col0"))
    val listener = execute("select 1", module = "presto-prod")

    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-start","data":{"id":"query-id"}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-details","data":{"id":"query-id","code":"select 1"}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-id","percentage":0}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"fields","data":{"id":"query-id","fields":["_col0"]}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"row","data":{"id":"query-id","values":["1"]}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-id","percentage":100}}"""))
    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-end","data":{"id":"query-id"}}"""))
  }

  @Test
  def handleUnknownMessage(): Unit = {
    executor.withResults(List(List("1")), columns = List("_col0"))
    val listener = send("ping", "prod")

    assertThat(listener.messagesJ, Matchers.hasItem(Matchers.containsString("Failed to handle unknown message : [ping]")))
  }

  @Test
  def handlePingEvent(): Unit = {
    executor.withResults(List(List("1")), columns = List("_col0"))
    val listener = send("""{"event":"ping"}""", "prod")

    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"pong","data":{}}"""))
  }

  @Test
  def handleMultipleStatements(): Unit = {
    executor
      .withResults(List(List("1")), queryId = "query-1", columns = List("foo"))
      .withResults(List(List("2")), queryId = "query-2", columns = List("boo"))

    val listener = execute("select 1 as foo;\nselect 2 as boo", module = "presto-prod")

    // first query
    {
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-start","data":{"id":"query-1"}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-details","data":{"id":"query-1","code":"select 1 as foo"}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"fields","data":{"id":"query-1","fields":["foo"]}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-1","percentage":0}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"row","data":{"id":"query-1","values":["1"]}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-1","percentage":100}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-end","data":{"id":"query-1"}}"""))
    }

    // second query
    {
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-start","data":{"id":"query-2"}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-details","data":{"id":"query-2","code":"select 2 as boo"}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"fields","data":{"id":"query-2","fields":["boo"]}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-2","percentage":0}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"row","data":{"id":"query-2","values":["2"]}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"percentage","data":{"id":"query-2","percentage":100}}"""))
      assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-end","data":{"id":"query-2"}}"""))
    }

  }

}
