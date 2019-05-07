package quix.presto.rest

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.ActiveQuery
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.core.utils.TaskOps._
import quix.presto.PrestoConfig
import scalaj.http.{Http, HttpResponse}

import scala.concurrent.duration._

class ScalaJPrestoStateClient(config: PrestoConfig)
  extends PrestoStateClient with StringJsonHelpersSupport with LazyLogging {

  override def init(query: ActiveQuery[String]): Task[PrestoState] = {
    for {
      _ <- Task.eval(logger.info(s"method=init query-id=${query.id} query-sql=[${query.text.replace("\n", "-newline-")}] statements-api=${config.statementsApi}"))

      state <- Task
        .eval(ScalaJPrestoOps.buildInitRequest(query, config).asString)
        .retry(2, 1.second)
        .logOnError(s"event=init-presto-client-error query-id=${query.id} query-sql=[${query.text.replace("\n", "-newline-")}]")
        .flatMap(response => readPrestoState[PrestoState](response))
    } yield state
  }

  def readPrestoState[T: Manifest](response: HttpResponse[String]): Task[T] = {
    if (response.isSuccess) {
      Task.eval(response.body.as[T])
        .logOnError(s"event=read-presto-state-error response.code=${response.code} " +
          s"response.statusLine=${response.statusLine} response.body=${response.body}")
    } else {
      Task.raiseError(new IllegalArgumentException(response.body))
    }
  }

  override def advance(uri: String): Task[PrestoState] = {
    for {
      _ <- Task.eval(logger.info(s"method=advance uri=$uri"))

      response <- Task
        .eval(Http(uri).asString)
        .retry(2, 1.second)
        .logOnError(s"event=advance-presto-client-error uri=$uri")

      state <- readPrestoState[PrestoState](response)
    } yield state
  }

  override def close(state: PrestoState): Task[Unit] = {
    val infoTask = for {
      queryInfo <- info(state)
      _ <- Task.eval(logger.info(s"method=close " +
        s"event=info " +
        s"state=${queryInfo.state} " +
        s"presto-id=${queryInfo.queryId} " +

        s"output-data-size=${queryInfo.queryStats.outputDataSize} " +
        s"input-data-size=${queryInfo.queryStats.processedInputDataSize} " +

        s"input-rows=${queryInfo.queryStats.processedInputPositions} " +
        s"output-rows=${queryInfo.queryStats.outputPositions} " +

        s"planning-time=${queryInfo.queryStats.totalPlanningTime} " +
        ""))
    } yield ()

    for {
      _ <- infoTask.attempt
      _ <- Task.eval(logger.info(s"method=close event=start next-uri=${state.nextUri} presto-id=${state.id}"))
      _ <- if (state.nextUri.isDefined) Task.eval(Http(state.nextUri.get).method("DELETE").asString) else Task.unit
    } yield ()
  }

  override def info(state: PrestoState): Task[PrestoQueryInfo] = {
    for {
      _ <- Task.eval(logger.info(s"method=info state=${state.stats.state} presto-id=${state.id}"))

      response <- Task.eval(Http(config.queryInfoApi + state.id).asString)

      queryInfo <- readPrestoState[PrestoQueryInfo](response)
    } yield queryInfo
  }

  override def health(): Task[PrestoHealth] = {
    for {
      _ <- Task.eval(logger.info(s"method=health"))

      response <- Task.eval(Http(config.healthApi).asString)

      health <- readPrestoState[PrestoHealth](response)
    } yield health
  }
}
