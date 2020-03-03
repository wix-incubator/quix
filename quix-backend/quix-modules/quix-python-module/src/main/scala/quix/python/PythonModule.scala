package quix.python

import monix.eval.Task
import quix.api.v1.db.Db
import quix.api.v1.execute.StartCommand
import quix.api.v1.users.User
import quix.api.v2.execute.{Builder, ExecutionModule, ImmutableSubQuery, Query}

import scala.collection.mutable

class PythonModule(val executor: PythonExecutor) extends ExecutionModule {

  def start(command: StartCommand[String], id: String, user: User, builder: Builder): Task[Unit] = {
    val subQuery = ImmutableSubQuery(command.code, user)
    val query = Query(List(subQuery), canceled = subQuery.canceled)

    for {
      _ <- builder.start(query)
      _ <- executor.execute(subQuery, builder)
      _ <- builder.end(query)
    } yield ()
  }

  override def db: Option[Db] = None
}
