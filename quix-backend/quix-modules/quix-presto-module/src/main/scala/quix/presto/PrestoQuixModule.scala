package quix.presto

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.api.module.ExecutionModule
import quix.api.users.User
import quix.core.executions.SequentialExecutions
import quix.core.sql.PrestoSqlOps

case class PrestoConfig(statementsApi: String, healthApi: String, queryInfoApi: String, schema: String, catalog: String, source: String)

class PrestoQuixModule(val prestoExecutions: SequentialExecutions[String]) extends ExecutionModule[String, Batch] with LazyLogging {
  override def name: String = "presto"

  override def start(command: StartCommand[String], id: String, user: User, resultBuilder: Builder[String, Batch]): Task[Unit] = {
    logger.info(s"event=start-command consumer-id=$id user=${user.email}")

    val sqls = PrestoSqlOps.splitToStatements(command.code)

    prestoExecutions
      .execute(sqls, user, resultBuilder)
      .doOnCancel(prestoExecutions.kill(id, user))
  }

}