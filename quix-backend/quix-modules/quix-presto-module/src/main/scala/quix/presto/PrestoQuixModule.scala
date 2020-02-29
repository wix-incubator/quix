package quix.presto

import quix.api.v1.db.Db
import quix.api.v1.execute._
import quix.core.executions.{SequentialExecutions, SqlModule}

case class PrestoConfig(statementsApi: String, healthApi: String, queryInfoApi: String, schema: String, catalog: String, source: String)

object PrestoQuixModule {
  def apply(executor: AsyncQueryExecutor[String, Batch], db: Option[Db]) = {
    val executions = new SequentialExecutions[String](executor)
    new SqlModule(executions, db)
  }
}