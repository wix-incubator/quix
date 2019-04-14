package quix.presto

import java.net.{ConnectException, SocketException, SocketTimeoutException}

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, ResultBuilder}

import scala.concurrent.duration._
import quix.core.utils.TaskOps._
import quix.presto.rest.{PrestoState, PrestoStateClient, Results}

class QueryExecutor(val client: PrestoStateClient,
                    val initialAdvanceDelay: FiniteDuration = 100.millis,
                    val maxAdvanceDelay: FiniteDuration = 33.seconds)
  extends AsyncQueryExecutor[Results] with LazyLogging {

  def loop(prestoId: String, state: String, rows: Int, nextUri: Option[String], builder: ResultBuilder[Results], query: ActiveQuery, delay: FiniteDuration = initialAdvanceDelay): Task[Option[String]] = {
    logger.info(s"method=loop event=start query-id=${query.id} user=${query.user.email} presto-id=$prestoId state=$state rows=$rows")

    nextUri match {
      case Some(uri) if !query.isCancelled =>
        for {
          nextState <- advance(uri, builder, prestoId, query, delay)

          _ <- builder.addSubQuery(prestoId, Results(nextState))
            .logOnError(s"method=loop event=error-addSubQuery query-id=${query.id} user=${query.user.email} presto-id=$prestoId")

          state = nextState.stats.state
          rows = nextState.data.map(_.size).getOrElse(0)

          futureState <- loop(prestoId, state, rows, nextState.nextUri, builder, query, nextDelay(delay, nextState))
        } yield futureState

      case _ =>
        logger.info(s"method=loop event=stop canceled=${query.isCancelled} query-id=${query.id} user=${query.user.email} presto-id=$prestoId state=$state")

        Task.now(nextUri)
    }
  }

  // if got no results from presto, wait twice longer for next page
  def nextDelay(delay: FiniteDuration, state: PrestoState): FiniteDuration = {
    if (state.data.map(_.size).getOrElse(0) == 0)
      delay.mul(2).min(maxAdvanceDelay) else initialAdvanceDelay
  }

  def advance(uri: String, builder: ResultBuilder[Results], queryId: String, query: ActiveQuery, delay: FiniteDuration = initialAdvanceDelay): Task[PrestoState] = {
    logger.info(s"method=advance query-id=${query.id} user=${query.user.email} presto-id=$queryId uri=$uri delay=${delay.toSeconds}")
    client.advance(uri)
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
  }

  def runTask(query: ActiveQuery, builder: ResultBuilder[Results]): Task[Unit] = {
    val executionTask = initClient(query, builder).bracket { firstState =>
      for {
        _ <- builder.startSubQuery(firstState.id, query.text, Results(firstState))
          .logOnError(s"method=runAsync event=error-startSubQuery query-id=${query.id} user=${query.user.email} presto-id=${firstState.id}")

        _ <- loop(firstState.id, firstState.stats.state, firstState.data.map(_.size).getOrElse(0), firstState.nextUri, builder, query)

        _ <- builder.endSubQuery(firstState.id)
          .logOnError(s"method=runAsync event=error-endSubQuery query-id=${query.id} user=${query.user.email} presto-id=${firstState.id}")
      } yield ()
    }(client.close)

    val task = for {
      _ <- Task.eval(logger.info(s"method=runAsync event=start query-id=${query.id} user=${query.user.email} " +
        s"sql=${query.text.replace("\n", "-newline-").replace("\\s", "-space-")}"))
      _ <- executionTask
      _ <- Task.eval(logger.info(s"method=runAsync event=end query-id=${query.id} user=${query.user.email} rows=${builder.rowCount}"))
    } yield ()

    task
  }

  def initClient(query: ActiveQuery, builder: ResultBuilder[Results]): Task[PrestoState] = {
    logger.info(s"method=initClient event=start query-id=${query.id} user=${query.user.email}")
    client.init(query).onErrorHandleWith {
      case e: Exception =>
        val ex = rewriteException(e)
        builder.error(query.id, ex)
          .logOnError(s"method=initClient event=error query-id=${query.id} user=${query.user.email}")
          .flatMap(_ => Task.raiseError(ex))
    }
  }

  def rewriteException(e: Exception): Exception = e match {
    case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
      new IllegalStateException(s"Presto can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}", e)
    case _ => e
  }
}
