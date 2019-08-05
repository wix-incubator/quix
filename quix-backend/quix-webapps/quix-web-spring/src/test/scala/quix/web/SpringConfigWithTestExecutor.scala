package quix.web

import org.springframework.context.annotation.{Bean, Configuration, Import, Primary}
import quix.api.execute.Batch
import quix.api.module.ExecutionModule
import quix.bigquery.db.{BigQueryAutocomplete, BigQueryCatalogs, BigQueryTables}
import quix.bigquery.{BigQueryQuixModule, BigQueryTestQueryExecutor}
import quix.core.db.{RefreshableAutocomplete, RefreshableCatalogs, RefreshableDb}
import quix.presto.db.{PrestoAutocomplete, PrestoCatalogs, PrestoTables}
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
      "presto-prod" -> PrestoQuixModule(MockBeans.queryExecutor, Some(MockBeans.db)),
      "presto-dev" -> PrestoQuixModule(MockBeans.queryExecutor, Some(MockBeans.db)),
      "bigquery-prod" -> BigQueryQuixModule(BigQueryMockBeans.bigQueryQueryExecutor, BigQueryMockBeans.bigQueryDb),
      "bigquery-dev" -> BigQueryQuixModule(BigQueryMockBeans.bigQueryQueryExecutor, BigQueryMockBeans.bigQueryDb),
    )
  }
}

object MockBeans {
  val duration = FiniteDuration(5, "seconds").toMillis
  val queryExecutor = new TestQueryExecutor

  val catalogs = new PrestoCatalogs(queryExecutor)
  val autocomplete = new PrestoAutocomplete(catalogs, queryExecutor)
  val tables = new PrestoTables(queryExecutor, 60000)

  val refreshableCatalogs = new RefreshableCatalogs(catalogs, 60000, 6000)
  val refreshableAutocomplete = new RefreshableAutocomplete(autocomplete, 60000, 60000)

  val db = new RefreshableDb(refreshableCatalogs, refreshableAutocomplete, tables)
}


object BigQueryMockBeans {
  val duration = FiniteDuration(5, "seconds").toMillis
  val bigQueryQueryExecutor = new BigQueryTestQueryExecutor

  val bigQueryCatalogs = new BigQueryCatalogs(bigQueryQueryExecutor)
  val bigQueryAutocomplete = new BigQueryAutocomplete(bigQueryCatalogs, bigQueryQueryExecutor)
  val bigQueryTables = new BigQueryTables(bigQueryQueryExecutor, 60000)

  val bigQueryRefreshableCatalogs = new RefreshableCatalogs(bigQueryCatalogs, 60000, 6000)
  val bigQueryRefreshableAutocomplete = new RefreshableAutocomplete(bigQueryAutocomplete, 60000, 60000)

  val bigQueryDb = new RefreshableDb(bigQueryRefreshableCatalogs, bigQueryRefreshableAutocomplete, bigQueryTables)
}
