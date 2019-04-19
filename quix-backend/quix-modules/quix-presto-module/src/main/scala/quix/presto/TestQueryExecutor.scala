package quix.presto

import monix.eval.Task
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, ResultBuilder}
import quix.presto.rest._

import scala.collection.mutable

class SingleExecution(exception: Option[Exception] = Option.empty[Exception],
                      error: Option[PrestoError] = Option.empty[PrestoError],
                      results: List[List[AnyRef]] = Nil,
                      queryId: String = "test-query-id",
                      columns: List[String] = Nil) {

  def prestoColumns = {
    if (columns.nonEmpty) {
      Option(columns.map { name => PrestoColumn(name, "string") })
    } else None
  }

  def act(query: ActiveQuery, builder: ResultBuilder[Results]): Task[Unit] = {
    val client = new PrestoStateClient {
      var index = 0

      override def init(query: ActiveQuery): Task[PrestoState] = {
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


      override def advance(uri: String): Task[PrestoState] = Task.eval {
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

      override def close(state: PrestoState): Task[Unit] = Task.unit

      override def info(state: PrestoState): Task[PrestoQueryInfo] = Task.eval {
        val queryStats = PrestoQueryStats("0", "0", 0, "", "", "", 0)
        PrestoQueryInfo(queryId, "FINISHED", queryStats)
      }

      override def health(): Task[PrestoHealth] = Task.eval {
        PrestoHealth(0, 0, 0, 0, 0, 0, 0, 0, 0)
      }
    }
    new QueryExecutor(client).runTask(query, builder)
  }
}

class TestQueryExecutor extends AsyncQueryExecutor[Results] {

  val executions: mutable.Queue[SingleExecution] = mutable.Queue.empty
  var resultBuilder: ResultBuilder[Results] = _

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

  def withResults(results: List[List[AnyRef]], queryId: String = "query-id", columns: List[String] = Nil) = {
    executions.enqueue(new SingleExecution(results = results, queryId = queryId, columns = columns))
    this
  }

  override def runTask(query: ActiveQuery, builder: ResultBuilder[Results]): Task[Unit] = {
    for {
      _ <- Task.eval(resultBuilder = builder)
      execution <- Task.eval(executions.dequeue())
      _ <- execution.act(query, builder)
    } yield ()
  }

  def clear = {
    executions.clear()
    this
  }
}