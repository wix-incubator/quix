package quix.api.execute

import java.io.IOException

import monix.eval.Task
import quix.api.users.User

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