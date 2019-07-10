package quix.web

import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.execute.Batch
import quix.api.module.ExecutionModule
import quix.presto.db.{PrestoAutocomplete, PrestoCatalogs, PrestoRefreshableDb, PrestoTables, RefreshableDbConfig}
import quix.presto.{PrestoQuixModule, TestQueryExecutor}
import quix.web.spring._

import scala.concurrent.duration.FiniteDuration

@Configuration
@Import(Array(classOf[SpringConfig]))
class SpringConfigWithTestExecutor {

  @Bean
  @Primary
  def initModules: Map[String, ExecutionModule[String, Batch]] = {
    Map(
      "presto" -> PrestoQuixModule(MockBeans.queryExecutor, Some(MockBeans.db)),
    )
  }
}

object MockBeans {
  val duration = FiniteDuration(5, "seconds").toMillis
  val queryExecutor = new TestQueryExecutor

  val catalogs = new PrestoCatalogs(queryExecutor, 1000L, 60000L)
  val autocomplete = new PrestoAutocomplete(catalogs, queryExecutor, 1000L, 60000L)
  val tables = new PrestoTables(queryExecutor, 1000L)
  val db = new PrestoRefreshableDb(catalogs, autocomplete, tables)
}
