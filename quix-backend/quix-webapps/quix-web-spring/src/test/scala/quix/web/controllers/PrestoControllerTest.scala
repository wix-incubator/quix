package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.runner.RunWith
import org.junit.{Before, Test}
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.web.{E2EContext, MockBeans, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class PrestoControllerTest extends E2EContext with LazyLogging {

  new TestContextManager(this.getClass).prepareTestInstance(this)

  val executor = MockBeans.queryExecutor

  @Before
  def executeBeforeEachTest(): Unit = executor.clear

  @Test
  def passSanity(): Unit = {
    executor.withResults(List(List("1")))
    val listener = execute("select 1")

    assertThat(listener.messagesJ, Matchers.hasItem("""{"event":"query-start","data":{"id":"query-id"}}"""))
  }

}
