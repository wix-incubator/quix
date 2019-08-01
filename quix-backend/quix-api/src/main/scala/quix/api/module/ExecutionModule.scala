package quix.api.module

import monix.eval.Task
import quix.api.db.Db
import quix.api.execute.{Builder, StartCommand}
import quix.api.users.User

trait ExecutionModule[Code, Results] {
  def start(command: StartCommand[Code], id: String, user: User, builder: Builder[Code, Results]): Task[Unit]

  def db: Option[Db]
}