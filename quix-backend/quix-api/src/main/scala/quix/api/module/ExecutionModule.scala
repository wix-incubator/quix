package quix.api.module

import monix.eval.Task
import quix.api.execute.{Consumer, StartCommand}

trait ExecutionModule[Code, Results] {
  def name: String

  def start(command: StartCommand[Code], consumer: Consumer[Results]): Task[Unit]
}
