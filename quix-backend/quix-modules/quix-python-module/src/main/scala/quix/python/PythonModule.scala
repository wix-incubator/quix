package quix.python

import monix.eval.Task
import quix.api.db.Db
import quix.api.execute.{ActiveQuery, Batch, Builder, StartCommand}
import quix.api.module.ExecutionModule
import quix.api.users.User

class PythonModule(val executor: PythonExecutor) extends ExecutionModule[String, Batch] {

  override def start(command: StartCommand[String], id: String, user: User, builder: Builder[String, Batch]): Task[Unit] = {
    val query = ActiveQuery(id, Seq(command.code), user, session = command.session)

    for {
      _ <- builder.start(query)
      _ <- executor.runTask(query, builder)
      _ <- builder.end(query)
    } yield ()
  }

  override def db: Option[Db] = None
}
