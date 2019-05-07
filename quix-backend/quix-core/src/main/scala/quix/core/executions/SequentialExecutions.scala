package quix.core.executions

import java.util.UUID

import com.github.blemale.scaffeine.{Cache, Scaffeine}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.api.users.User

import scala.concurrent.duration._

class SequentialExecutions[Code](val executor: AsyncQueryExecutor[Code, Batch])
  extends Executions[Code, Batch] with LazyLogging {

  val queries: Cache[String, ActiveQuery[Code]] =
    Scaffeine()
      .expireAfterWrite(1.hour)
      .maximumSize(500)
      .build[String, ActiveQuery[Code]]()

  def execute(statements: Seq[Code], user: User, resultBuilder: Builder[Code, Batch]): Task[Unit] = {
    if (statements.isEmpty) {
      Task.unit
    } else {
      val activeQuery = ActiveQuery[Code](UUID.randomUUID().toString, statements.head, statements.size, user, isCancelled = false, session = Map.empty)

      val loop = for {
        _ <- Task.eval(queries.put(activeQuery.id, activeQuery))
        _ <- resultBuilder.start(activeQuery)
        _ <- makeLoop(activeQuery, statements, resultBuilder)
      } yield ()

      loop.doOnFinish { _ =>
        for {
          _ <- Task.eval(queries.invalidate(activeQuery.id))
          _ <- resultBuilder.end(activeQuery)
        } yield ()
      }
    }
  }

  def makeLoop(activeQuery: ActiveQuery[Code], sqls: Seq[Code], builder: Builder[Code, Batch]): Task[Unit] = {
    Task.eval(builder.lastError).flatMap {
      case None =>
        sqls match {
          case sql :: tail =>
            for {
              _ <- Task.eval {
                activeQuery.text = sql
              }
              _ <- executor.runTask(activeQuery, builder)
              _ <- makeLoop(activeQuery, tail, builder)
            } yield ()
          case _ =>
            Task.unit
        }

      case Some(error) => Task.raiseError(error)
    }
  }

  override def kill(id: String, user: User): Task[Unit] = Task {
    for {
      query <- queries.getIfPresent(id)
    } query.isCancelled = true
  }
}


