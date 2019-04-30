package quix.web

import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.db.Db
import quix.api.execute.{AsyncQueryExecutor, Batch}
import quix.presto.TestQueryExecutor
import quix.presto.db.{RefreshableDb, RefreshableDbConfig}
import quix.web.spring._

import scala.concurrent.duration.FiniteDuration

@Configuration
@Import(Array(classOf[SpringConfig]))
class SpringConfigWithTestExecutor {

  @Bean
  @Primary
  def initQueryExecutorMock: AsyncQueryExecutor[Batch] = MockBeans.queryExecutor

  @Bean
  @Primary
  def initDbMock: Db = MockBeans.db
}

object MockBeans {
  val duration = FiniteDuration(5, "seconds")
  val queryExecutor = new TestQueryExecutor
  val db = new RefreshableDb(queryExecutor, RefreshableDbConfig(duration, duration))
}
