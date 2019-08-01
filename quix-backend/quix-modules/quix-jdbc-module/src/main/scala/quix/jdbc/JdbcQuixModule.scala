package quix.jdbc

import monix.eval.Task
import quix.api.db.Db
import quix.api.execute.{AsyncQueryExecutor, Batch, Builder, StartCommand}
import quix.api.module.ExecutionModule
import quix.api.users.User
import quix.core.executions.SequentialExecutions
import quix.core.sql.PrestoSqlOps

class JdbcQuixModule(val executions: SequentialExecutions[String], val db: Option[Db] = None)
  extends ExecutionModule[String, Batch] {

  override def start(
    command: StartCommand[String],
    id: String,
    user: User,
    resultBuilder: Builder[String, Batch]): Task[Unit] = {
    val sqls = PrestoSqlOps.splitToStatements(command.code)

    executions
      .execute(sqls, user, resultBuilder)
      .doOnCancel(executions.kill(id, user))
  }
}

object JdbcQuixModule {
  def apply(executor: AsyncQueryExecutor[String, Batch], db : Db): JdbcQuixModule = {
    val executions = new SequentialExecutions[String](executor)

    new JdbcQuixModule(executions, Option(db))
  }
}
