package quix.bigquery

import monix.eval.Task
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, Batch, Builder}

import scala.collection.mutable
import scala.concurrent.duration.{Duration, FiniteDuration}

class SingleBigQueryExecution(exception: Option[Exception] = Option.empty[Exception],
                              results: List[List[AnyRef]] = Nil,
                              queryId: String = "test-query-id",
                              columns: List[String] = Nil,
                              delay: FiniteDuration = Duration.Zero) {

  def act(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = Task.unit
}

class BigQueryTestQueryExecutor extends AsyncQueryExecutor[String, Batch] {

  val executions: mutable.Queue[SingleBigQueryExecution] = mutable.Queue.empty
  var resultBuilder: Builder[String, Batch] = _

  def withException(e: Exception) = {
    executions.enqueue(new SingleBigQueryExecution(exception = Some(e)))
    this
  }

  def withExceptions(e: Exception, n: Int) = {
    for (e <- List.fill(n)(e))
      executions.enqueue(new SingleBigQueryExecution(exception = Some(e)))
    this
  }

  def withResults(results: List[List[AnyRef]], queryId: String = "query-id", columns: List[String] = Nil, delay: FiniteDuration = Duration.Zero) = {
    executions.enqueue(new SingleBigQueryExecution(results = results, queryId = queryId, columns = columns, delay = delay))
    this
  }

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
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