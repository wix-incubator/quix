package quix.core.executions

import monix.eval.Task
import quix.api.v1.db.Db
import quix.api.v1.execute.{Batch, Builder, StartCommand}
import quix.api.v1.module.ExecutionModule
import quix.api.v1.users.User
import quix.core.sql.{PrestoLikeSplitter, SqlSplitter}

class SqlModule(val executions: SequentialExecutions[String],
                val db: Option[Db],
                val splitter: SqlSplitter = PrestoLikeSplitter) extends ExecutionModule[String, Batch] {
  override def start(command: StartCommand[String], id: String, user: User, builder: Builder[String, Batch]): Task[Unit] = {
    val sqls = splitter.split(command.code)

    executions
      .execute(sqls, user, builder)
      .doOnCancel(executions.kill(id, user))
  }
}
