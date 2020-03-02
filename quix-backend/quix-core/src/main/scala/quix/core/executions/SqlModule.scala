package quix.core.executions

import monix.eval.Task
import monix.execution.atomic.Atomic
import quix.api.v1.db.Db
import quix.api.v1.execute.StartCommand
import quix.api.v1.users.User
import quix.api.v2.execute._
import quix.core.sql.{PrestoLikeSplitter, SqlSplitter}

class SqlModule(val executor: Executor,
                val db: Option[Db],
                val splitter: SqlSplitter = PrestoLikeSplitter) extends ExecutionModule {

  override def start(command: StartCommand[String], id: String, user: User, builder: Builder): Task[Unit] = {
    val canceled = Atomic(false)

    val subQueries = splitter.split(command.code).map { sql =>
      ImmutableSubQuery(sql, user, canceled = canceled)
    }

    val query = Query(subQueries, id, canceled)

    for {
      _ <- builder.start(query)
      _ <- Task.traverse(subQueries)(q => executor.execute(q, builder)).attempt
      _ <- builder.end(query)
    } yield ()
  }
}
