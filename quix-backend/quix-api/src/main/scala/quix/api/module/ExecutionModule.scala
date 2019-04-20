package quix.api.module

import monix.eval.Task
import quix.api.execute.{ResultBuilder, StartCommand}
import quix.api.users.User

trait ExecutionModule[Code, Results] {
  def name: String

  def start(command: StartCommand[Code], id: String, user: User, builder: ResultBuilder[Results]): Task[Unit]
}
