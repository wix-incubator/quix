package quix.presto

import java.net.{ConnectException, SocketException, SocketTimeoutException}

import monix.eval.Task
import quix.api.v1.execute.ExceptionPropagatedToClient
import quix.api.v2.execute._
import quix.presto.rest.{PrestoState, PrestoStateClient, PrestoStateToResults}

import scala.concurrent.duration._

class QueryExecutor(val client: PrestoStateClient,
                    val initialAdvanceDelay: FiniteDuration = 100.millis,
                    val maxAdvanceDelay: FiniteDuration = 33.seconds)
  extends Executor {

  // if got no results from presto, wait twice longer for next page
  def nextDelay(delay: FiniteDuration, state: PrestoState): FiniteDuration = {
    if (state.data.map(_.size).getOrElse(0) == 0)
      delay.mul(2).min(maxAdvanceDelay) else initialAdvanceDelay
  }

  def loop(prestoId: String, nextUri: Option[String], builder: Builder, query: SubQuery, delay: FiniteDuration): Task[Option[String]] = {
    Task(query.canceled.get()).flatMap {
      case true =>
        Task(Option.empty[String])

      case false =>
        nextUri.map { uri =>
          for {
            nextState <- advance(uri, builder, query, delay)
            _ <- builder.addSubQuery(prestoId, PrestoStateToResults(nextState))
            futureState <- loop(prestoId, nextState.nextUri, builder, query, nextDelay(delay, nextState))
          } yield futureState
        }.getOrElse(Task(Option.empty[String]))
    }
  }

  def advance(uri: String, builder: Builder, query: SubQuery, delay: FiniteDuration): Task[PrestoState] = {
    client.advance(uri, query)
      .delayExecution(delay)
      .onErrorHandleWith { originalException =>
        val exception = rewriteException(originalException)
        builder.errorSubQuery(query.id, exception)
          .flatMap(_ => Task.raiseError(exception))
      }
  }

  override def execute(query: SubQuery, builder: Builder): Task[Unit] = {
    val executionTask = initClient(query, builder).bracket { firstState =>
      for {
        _ <- builder.startSubQuery(firstState.id, query.text)
        _ <- builder.addSubQuery(firstState.id, PrestoStateToResults(firstState))

        _ <- loop(firstState.id, firstState.nextUri, builder, query, initialAdvanceDelay)

        _ <- builder.endSubQuery(firstState.id)
        info <- client.info(firstState, query)
      } yield info
    }(state => client.close(state, query))

    val task = for {
      info <- executionTask
      _ <- Task {
        info.setCatalog.foreach(catalog => query.session.put("X-Presto-Catalog", catalog))
        info.setSchema.foreach(schema => query.session.put("X-Presto-Schema", schema))
        info.setSessionProperties.foreach { case (k, v) => query.session.put(k, v) }
        info.resetSessionProperties.foreach(key => query.session.remove(key))
      }
    } yield ()

    task

  }

  def initClient(query: SubQuery, builder: Builder): Task[PrestoState] = {
    client.init(query).onErrorHandleWith { originalException =>
      val exception = rewriteException(originalException)
      builder.error(query.id, exception)
        .flatMap(_ => Task.raiseError(exception))
    }
  }

  def rewriteException(e: Throwable): Throwable = e match {
    case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
      val message = s"Presto can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}"
      ExceptionPropagatedToClient(message)
    case _ => e
  }
}
