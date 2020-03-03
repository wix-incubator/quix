package quix.core.executions

import monix.eval.Task
import quix.api.v1.db.Db
import quix.api.v1.execute.StartCommand
import quix.api.v1.users.User
import quix.api.v2.execute._
import quix.core.sql.{PrestoLikeSplitter, SqlSplitter}

class SqlModule(val executor: Executor,
                val db: Option[Db],
                val splitter: SqlSplitter = PrestoLikeSplitter) extends ExecutionModule {

  override def start(command: StartCommand[String], id: String, user: User, builder: Builder): Task[Unit] = {
    val query = splitter.split(command, id, user)

    for {
      _ <- builder.start(query)
      _ <- Task.traverse(query.subQueries) { q =>
        Task(builder.lastError).flatMap {
          case None =>
            executor.execute(q, builder)
          case Some(e) =>
            Task.raiseError(e)
        }
      }.attempt
      _ <- builder.end(query)
    } yield ()
  }
}
