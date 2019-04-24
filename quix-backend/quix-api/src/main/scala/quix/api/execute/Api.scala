package quix.api.execute

import java.io.IOException

import monix.eval.Task
import quix.api.users.User

trait Consumer[Message] {
  def id: String

  def user: User

  @throws[IOException]
  def write(payload: Message): Task[Unit]

  @throws[IOException]
  def close(): Task[Unit]
}