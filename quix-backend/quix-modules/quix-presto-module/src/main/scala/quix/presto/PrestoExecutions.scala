package quix.presto

import java.util.UUID
import java.util.concurrent.TimeUnit

import com.google.common.cache.{Cache, CacheBuilder}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.api.users.User
import quix.presto.rest.PrestoSql

class PrestoExecutions(val executor: AsyncQueryExecutor[Batch])
  extends Executions[PrestoSql, Batch] with LazyLogging {

  val queries: Cache[String, ActiveQuery] = CacheBuilder.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(90, TimeUnit.MINUTES)
    .build()

  def execute(sqls: Seq[PrestoSql], user: User, resultBuilder: Builder[Batch]): Task[Unit] = {
    val activeQuery = ActiveQuery(UUID.randomUUID().toString, "", sqls.size, user, isCancelled = false, Map.empty)

    val loop = for {
      _ <- Task.eval(queries.put(activeQuery.id, activeQuery))
      _ <- resultBuilder.start(activeQuery)
      _ <- makeLoop(activeQuery, sqls, resultBuilder)
    } yield ()

    loop.doOnFinish { _ =>
      for {
        _ <- Task.eval(queries.invalidate(activeQuery.id))
        _ <- resultBuilder.end(activeQuery)
      } yield ()
    }
  }

  def makeLoop(activeQuery: ActiveQuery, sqls: Seq[PrestoSql], builder: Builder[Batch]): Task[Unit] = {
    Task.eval(builder.lastError).flatMap {
      case None =>
        sqls match {
          case sql :: tail =>
            for {
              _ <- Task.eval {
                activeQuery.text = sql.text
                activeQuery.session = sql.session
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
      query <- Option(queries.getIfPresent(id))
    } query.isCancelled = true
  }
}


