package quix.core.executions

import java.util.UUID

import com.github.blemale.scaffeine.{Cache, Scaffeine}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v1.execute._
import quix.api.v1.users.User

import scala.concurrent.duration._

class SequentialExecutions[Code](val executor: AsyncQueryExecutor[Code, Batch])
  extends LazyLogging {

  val queries: Cache[String, ActiveQuery[Code]] =
    Scaffeine()
      .expireAfterWrite(1.hour)
      .maximumSize(500)
      .build[String, ActiveQuery[Code]]()

  def execute(statements: Seq[Code], user: User, resultBuilder: Builder[Code, Batch]): Task[Unit] = {
    val activeQuery = ActiveQuery[Code](UUID.randomUUID().toString, statements, user)

    for {
      _ <- resultBuilder.start(activeQuery)
      _ <- Task(queries.put(activeQuery.id, activeQuery))
      _ <- makeLoop(activeQuery, resultBuilder).attempt
      _ <- Task(queries.invalidate(activeQuery.id))
      _ <- resultBuilder.end(activeQuery)
    } yield ()
  }

  def makeLoop(query: ActiveQuery[Code], builder: Builder[Code, Batch]): Task[Unit] = {
    Task(builder.lastError).flatMap {
      case None =>
        query.statements.lift(query.current) match {
          case Some(_) =>
            for {
              _ <- executor.runTask(query, builder)
              _ <- Task {
                query.current = query.current + 1
              }
              _ <- makeLoop(query, builder)
            } yield ()
          case None =>
            Task.unit
        }
      case Some(error) =>
        Task.raiseError(error)
    }
  }

  def kill(id: String, user: User): Task[Unit] = Task {
    for {
      query <- queries.getIfPresent(id)
    } query.isCancelled = true
  }
}


