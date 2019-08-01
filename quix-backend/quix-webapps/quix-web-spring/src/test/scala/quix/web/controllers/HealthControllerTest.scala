package quix.web.controllers

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment.DEFINED_PORT
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.context.{TestContextManager, TestPropertySource}
import quix.web.{E2EContext, SpringConfigWithTestExecutor}

@RunWith(classOf[SpringRunner])
@DirtiesContext
@SpringBootTest(webEnvironment = DEFINED_PORT, classes = Array(classOf[SpringConfigWithTestExecutor]))
@TestPropertySource(locations = Array("classpath:test.properties"))
class HealthControllerTest extends E2EContext {

  new TestContextManager(this.getClass).prepareTestInstance(this)

  @Test
  def serverShouldBeHealthAfterStartup(): Unit = {
    val health = getResponse("/health/is_alive")

    assertThat(health.code, Matchers.is(200))
    assertThat(health.body, Matchers.isEmptyString)
  }
}


