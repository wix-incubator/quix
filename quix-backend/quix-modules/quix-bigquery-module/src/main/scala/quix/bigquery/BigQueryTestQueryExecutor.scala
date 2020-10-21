package quix.bigquery

import monix.eval.Task
import quix.api.v2.execute.{Builder, Executor, SubQuery}

import scala.collection.mutable
import scala.concurrent.duration.{Duration, FiniteDuration}

class SingleBigQueryExecution(exception: Option[Exception] = Option.empty[Exception],
                              results: List[List[AnyRef]] = Nil,
                              queryId: String = "test-query-id",
                              columns: List[String] = Nil,
                              delay: FiniteDuration = Duration.Zero) {

  def act(query: SubQuery, builder: Builder): Task[Unit] = Task.unit
}

class BigQueryTestQueryExecutor extends Executor {

  val executions: mutable.Queue[SingleBigQueryExecution] = mutable.Queue.empty
  var resultBuilder: Builder = _

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