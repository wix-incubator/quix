package quix.api.module

import monix.eval.Task
import quix.api.execute.{Builder, StartCommand}
import quix.api.users.User

trait ExecutionModule[Code, Results] {
  def name: String

  def start(command: StartCommand[Code], id: String, user: User, builder: Builder[Results]): Task[Unit]
}