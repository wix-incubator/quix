package quix.presto

import java.net.{ConnectException, SocketException, SocketTimeoutException}

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.core.utils.TaskOps._
import quix.presto.rest.{PrestoState, PrestoStateClient, PrestoStateToResults}

import scala.concurrent.duration._

class QueryExecutor(val client: PrestoStateClient,
                    val initialAdvanceDelay: FiniteDuration = 100.millis,
                    val maxAdvanceDelay: FiniteDuration = 33.seconds)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  def loop(prestoId: String, state: String, rows: Int, nextUri: Option[String], builder: Builder[String, Batch], query: ActiveQuery[String], delay: FiniteDuration = initialAdvanceDelay): Task[Option[String]] = {
    val log = Task(logger.info(s"method=loop event=start query-id=${query.id} user=${query.user.email} presto-id=$prestoId state=$state rows=$rows"))

    val task = nextUri match {
      case Some(uri) if !query.isCancelled =>
        for {
          nextState <- advance(uri, builder, prestoId, query, delay)

          _ <- builder.addSubQuery(prestoId, PrestoStateToResults(nextState))
            .logOnError(s"method=loop event=error-addSubQuery query-id=${query.id} user=${query.user.email} presto-id=$prestoId")

          state = nextState.stats.state
          rows = nextState.data.map(_.size).getOrElse(0)

          futureState <- loop(prestoId, state, rows, nextState.nextUri, builder, query, nextDelay(delay, nextState))
        } yield futureState

      case _ =>
        for {
          _ <- Task(logger.info(s"method=loop event=stop canceled=${query.isCancelled} query-id=${query.id} user=${query.user.email} presto-id=$prestoId state=$state"))
        } yield nextUri
    }

    log.flatMap(_ => task)
  }

  // if got no results from presto, wait twice longer for next page
  def nextDelay(delay: FiniteDuration, state: PrestoState): FiniteDuration = {
    if (state.data.map(_.size).getOrElse(0) == 0)
      delay.mul(2).min(maxAdvanceDelay) else initialAdvanceDelay
  }

  def advance(uri: String, builder: Builder[String, Batch], queryId: String, query: ActiveQuery[String], delay: FiniteDuration = initialAdvanceDelay): Task[PrestoState] = {
    val log = Task(logger.info(s"method=advance query-id=${query.id} user=${query.user.email} presto-id=$queryId uri=$uri delay=${delay.toMillis / 1000.0}"))

    val task = client.advance(uri)
      .delayExecution(delay)
      .onErrorHandleWith {
        case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
          val ex = new IllegalStateException(s"Presto can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}", e)
          builder.errorSubQuery(queryId, ex)
            .logOnError(s"method=advance event=builder-failure-errorSubQuery query-id=${query.id} user=${query.user.email}")
            .flatMap(_ => Task.raiseError(ex))

        case ex: Exception =>
          builder.errorSubQuery(queryId, ex)
            .logOnError(s"method=advance event=builder-failure-errorSubQuery query-id=${query.id} user=${query.user.email}")
            .flatMap(_ => Task.raiseError(ex))
      }

    log.flatMap(_ => task)
  }

  def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    val executionTask = initClient(query, builder).bracket { firstState =>
      for {
        _ <- builder.startSubQuery(firstState.id, query.text, PrestoStateToResults(firstState))
          .logOnError(s"method=runAsync event=error-startSubQuery query-id=${query.id} user=${query.user.email} presto-id=${firstState.id}")

        _ <- loop(firstState.id, firstState.stats.state, firstState.data.map(_.size).getOrElse(0), firstState.nextUri, builder, query)

        _ <- builder.endSubQuery(firstState.id)
        info <- client.info(firstState)
          .logOnError(s"method=runAsync event=error-endSubQuery query-id=${query.id} user=${query.user.email} presto-id=${firstState.id}")
      } yield info
    }(client.close)

    val task = for {
      _ <- Task(logger.info(s"method=runAsync event=start query-id=${query.id} user=${query.user.email} " +
        s"sql=${query.text.replace("\n", "-newline-").replace("\\s", "-space-")}"))
      info <- executionTask
      _ <- Task {
        query.catalog = info.setCatalog
        query.schema = info.setSchema

        query.session = (query.session ++ info.setSessionProperties)
          .filterKeys(key => !info.resetSessionProperties.contains(key))
      }
      _ <- Task(logger.info(s"method=runAsync event=end query-id=${query.id} user=${query.user.email} rows=${builder.rowCount}"))
    } yield ()

    task
  }

  def initClient(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[PrestoState] = {
    val log = Task(logger.info(s"method=initClient event=start query-id=${query.id} user=${query.user.email}"))
    val task = client.init(query).onErrorHandleWith {
      case e: Exception =>
        val ex = rewriteException(e)
        builder.error(query.id, ex)
          .logOnError(s"method=initClient event=error query-id=${query.id} user=${query.user.email}")
          .flatMap(_ => Task.raiseError(ex))
    }

    log.flatMap(_ => task)
  }

  def rewriteException(e: Exception): Exception = e match {
    case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
      new IllegalStateException(s"Presto can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}", e)
    case _ => e
  }
}
