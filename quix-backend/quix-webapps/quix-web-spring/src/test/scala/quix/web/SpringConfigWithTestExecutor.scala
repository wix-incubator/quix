package quix.web

import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.execute.AsyncQueryExecutor
import quix.presto.TestQueryExecutor
import quix.presto.rest.Results
import quix.web.spring._

@Configuration
@Import(Array(classOf[SpringConfig]))
class SpringConfigWithTestExecutor {

  @Bean
  @Primary
  def initQueryExecutorMock: AsyncQueryExecutor[Results] = {
    TestQueryExecutorInstance.instance
  }
}

object TestQueryExecutorInstance {
  val instance = new TestQueryExecutor
}
