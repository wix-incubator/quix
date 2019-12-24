package quix.core.executions

import monix.eval.Task
import quix.api.db.Db
import quix.api.execute.{Batch, Builder, StartCommand}
import quix.api.module.ExecutionModule
import quix.api.users.User
import quix.core.sql.PrestoSqlOps

class SqlModule(val executions: SequentialExecutions[String], val db: Option[Db]) extends ExecutionModule[String, Batch] {
  override def start(command: StartCommand[String], id: String, user: User, builder: Builder[String, Batch]): Task[Unit] = {
    val sqls = PrestoSqlOps.splitToStatements(command.code)

    executions
      .execute(sqls, user, builder)
      .doOnCancel(executions.kill(id, user))
  }
}
