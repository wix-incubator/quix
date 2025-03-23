package quix.core.utils

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v1.execute.Consumer
import quix.api.v1.users.User

import scala.collection.mutable.ListBuffer

class TestConsumer[T] extends Consumer[T] with LazyLogging {
  val payloads = ListBuffer.empty[T]

  override def id: String = "id"

  override def user: User = User("test")

  override def write(payload: T): Task[Unit] = {
    Task(logger.info(s"payload : $payload")) *> Task(payloads += payload)
  }

  override def close(): Task[Unit] = Task.unit
}
