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
import quix.web.{E2EContext, MockBeans, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class DownloadControllerTest extends E2EContext {

  new TestContextManager(this.getClass).prepareTestInstance(this)
  val executor = MockBeans.queryExecutor

  @Before
  def executeBeforeEachTest: Unit = {
    executor.clear
  }

  @Test
  def passSanity(): Unit = {
    val response = getResponse("/api/download/i-do-not-exist")

    assertThat(response.code, Matchers.is(404))
  }

  @Test
  def sendSingleQuery(): Unit = {
    executor.withResults(List(List("1")), columns = List("_col0"), queryId = "query-id-1")
    val listener = runAndDownload("select 1", "presto-prod")

    listener.await("""{"event":"query-download","data":{"id":"query-id-1","url":"/api/download/query-id-1"}}""")

    val response = getResponse("/api/download/query-id-1")

    assertThat(response.body, Matchers.is("\"_col0\"\n\"1\"\n"))
  }

  @Test
  def sendMultipleQueries(): Unit = {
    executor
      .withResults(List(List("1")), columns = List("foo"), queryId = "query-id-1")
      .withResults(List(List("2")), columns = List("bar"), queryId = "query-id-2")

    val listener = runAndDownload("select 1 as foo;\nselect 2 as bar;", "presto-dev")

    listener.await("""{"event":"query-download","data":{"id":"query-id-1","url":"/api/download/query-id-1"}}""")
    val first = getResponse("/api/download/query-id-1")

    listener.await("""{"event":"query-download","data":{"id":"query-id-2","url":"/api/download/query-id-2"}}""")
    val second = getResponse("/api/download/query-id-2")

    assertThat(first.body, Matchers.is("\"foo\"\n\"1\"\n"))
    assertThat(second.body, Matchers.is("\"bar\"\n\"2\"\n"))
  }

}


