package quix.presto

import monix.eval.Task
import quix.api.v2.execute.{Builder, Executor, SubQuery}
import quix.presto.rest._

import scala.collection.mutable
import scala.concurrent.duration.{Duration, FiniteDuration}

class SingleExecution(exception: Option[Exception] = Option.empty[Exception],
                      error: Option[PrestoError] = Option.empty[PrestoError],
                      results: List[List[AnyRef]] = Nil,
                      queryId: String = "test-query-id",
                      columns: List[String] = Nil,
                      delay: FiniteDuration = Duration.Zero) {

  def prestoColumns = {
    if (columns.nonEmpty) {
      Option(columns.map { name => PrestoColumn(name, "string") })
    } else None
  }

  def act(query: SubQuery, builder: Builder): Task[Unit] = {
    val client = new PrestoStateClient {
      var index = 0

      override def init(query: SubQuery): Task[PrestoState] = {
        exception match {
          case Some(e) =>
            Task.raiseError(e)
          case None =>
            Task.eval {
              val nextUri = error.map(_ => None).getOrElse(Some("next-uri"))

              val stats = PrestoStats("QUEUED", true, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
              PrestoState(queryId, "info-uri", None, nextUri, prestoColumns, None, stats, error, None)
            }
        }
      }


      override def advance(uri: String, query: SubQuery): Task[PrestoState] = Task.eval {
        if (index + 1 <= results.size) {
          val stats = PrestoStats("RUNNING", true, 0, results.size, 0, 0, index, 0, 0, 0, 0, 0)
          val state = PrestoState(queryId, "info-uri", None, Some("next-uri"), prestoColumns, Option(List(results(index))), stats, None, None)
          index = index + 1
          state
        } else {
          val stats = PrestoStats("FINISHED", true, 0, results.size, 0, 0, results.size, 0, 0, 0, 0, 0)
          val restOfItems = results.drop(index)
          val state = PrestoState(queryId, "info-uri", None, None, prestoColumns, Option(restOfItems), stats, None, None)
          state
        }
      }

      override def close(state: PrestoState, query: SubQuery): Task[Unit] = Task.unit

      override def info(state: PrestoState, query: SubQuery): Task[PrestoQueryInfo] = Task.eval {
        val queryStats = PrestoQueryStats("0", "0", 0, "", "", "", 0)
        PrestoQueryInfo(queryId, "FINISHED", queryStats, None, None, Map.empty, List.empty)
      }

      override def health(): Task[PrestoHealth] = Task.eval {
        PrestoHealth(0, 0, 0, 0, 0, 0, 0, 0, 0)
      }
    }
    new QueryExecutor(client).execute(query, builder).delayExecution(delay)
  }
}

class TestQueryExecutor extends Executor {

  val executions: mutable.Queue[SingleExecution] = mutable.Queue.empty
  var resultBuilder: Builder = _

  def withException(e: Exception) = {
    executions.enqueue(new SingleExecution(exception = Some(e)))
    this
  }

  def withExceptions(e: Exception, n: Int) = {
    for (e <- List.fill(n)(e))
      executions.enqueue(new SingleExecution(exception = Some(e)))
    this
  }

  def withPrestoError(e: PrestoError): TestQueryExecutor = {
    executions.enqueue(new SingleExecution(error = Some(e)))
    this
  }

  def withResults(results: List[List[AnyRef]], queryId: String = "query-id", columns: List[String] = Nil, delay: FiniteDuration = Duration.Zero) = {
    executions.enqueue(new SingleExecution(results = results, queryId = queryId, columns = columns, delay = delay))
    this
  }

  override def execute(query: SubQuery, builder: Builder): Task[Unit] = {
    for {
      _ <- Task.eval(this.resultBuilder = builder)
      execution <- Task.eval(executions.dequeue())
      _ <- execution.act(query, builder)
    } yield ()
  }

  def clear = {
    executions.clear()
    this
  }
}