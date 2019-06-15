package quix.athena

import monix.eval.Task
import quix.api.execute.{Batch, Builder, StartCommand}
import quix.api.module.ExecutionModule
import quix.api.users.User
import quix.core.executions.SequentialExecutions
import quix.core.sql.PrestoSqlOps

class AthenaQuixModule(val executions: SequentialExecutions[String]) extends ExecutionModule[String, Batch] {
  override def name: String = "athena"

  override def start(command: StartCommand[String], id: String, user: User, resultBuilder: Builder[String, Batch]): Task[Unit] = {
    val sqls = PrestoSqlOps.splitToStatements(command.code)

    executions
      .execute(sqls, user, resultBuilder)
      .doOnCancel(executions.kill(id, user))
  }
}
