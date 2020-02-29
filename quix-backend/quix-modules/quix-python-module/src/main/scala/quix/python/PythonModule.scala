package quix.python

import monix.eval.Task
import quix.api.v1.db.Db
import quix.api.v1.execute.{ActiveQuery, Batch, Builder, StartCommand}
import quix.api.v1.module.ExecutionModule
import quix.api.v1.users.User

class PythonModule(val executor: PythonExecutor) extends ExecutionModule[String, Batch] {

  override def start(command: StartCommand[String], id: String, user: User, builder: Builder[String, Batch]): Task[Unit] = {
    val query = ActiveQuery(id, Seq(command.code), user, session = command.session)

    executor.runTask(query, builder)
  }

  override def db: Option[Db] = None
}
