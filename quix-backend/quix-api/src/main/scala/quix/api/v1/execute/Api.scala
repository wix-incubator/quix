package quix.api.v1.execute

import java.io.IOException

import monix.eval.Task
import quix.api.v1.users.User

/** End consumer of quix backend messages.
 * In case of quix frontend, it is a websocket channel.
 *
 */
trait Consumer[Message] {
  def id: String

  def user: User

  @throws[IOException]
  def write(payload: Message): Task[Unit]

  @throws[IOException]
  def close(): Task[Unit]
}