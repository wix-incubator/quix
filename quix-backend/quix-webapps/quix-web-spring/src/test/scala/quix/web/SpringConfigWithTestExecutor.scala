package quix.web

import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.db.Db
import quix.api.execute.AsyncQueryExecutor
import quix.presto.TestQueryExecutor
import quix.presto.db.RefreshableDb
import quix.presto.rest.Results
import quix.web.spring._

@Configuration
@Import(Array(classOf[SpringConfig]))
class SpringConfigWithTestExecutor {

  @Bean
  @Primary
  def initQueryExecutorMock: AsyncQueryExecutor[Results] = MockBeans.queryExecutor

  @Bean
  @Primary
  def initDbMock: Db = MockBeans.db
}

object MockBeans {
  val queryExecutor = new TestQueryExecutor
  val db = new RefreshableDb(queryExecutor)
}
