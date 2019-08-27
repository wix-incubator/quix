package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import Batch._

class MultiBuilder[Code](val consumer: Consumer[ExecutionEvent])
  extends Builder[Code, Batch] with LazyLogging {

  val started = System.currentTimeMillis()
  var rows = 0L
  val sentColumnsPerQuery = collection.mutable.Set.empty[String]
  var lastError: Option[Throwable] = None

  override def start(query: ActiveQuery[Code]) = {
    consumer.write(Start(query.id, query.statements.size))
  }

  override def end(query: ActiveQuery[Code]) = {
    consumer.write(End(query.id))
  }

  override def startSubQuery(queryId: String, code: Code, results: Batch) = {
    val resetCount = Task(rows = 0L)
    val startTask = consumer.write(SubQueryStart(queryId))
    val detailsTask = consumer.write(SubQueryDetails[Code](queryId, code))
    val subqueryTask = addSubQuery(queryId, results)

    Task.sequence(List(resetCount, startTask, detailsTask, subqueryTask)).map(_ => ())
  }

  override def endSubQuery(queryId: String) = {
    consumer.write(SubQueryEnd(queryId))
  }

  override def addSubQuery(queryId: String, results: Batch) = {
    val columnTask: Task[Unit] = results.columns.map(columns => sendColumns(queryId, columns)).getOrElse(Task.unit)
    val progressTask: Task[Unit] = results.percentage.map(percentage => sendProgress(queryId, percentage)).getOrElse(Task.unit)
    val errorTask: Task[Unit] = results.error.map(error => sendErrors(queryId, error)).getOrElse(Task.unit)

    rows += results.data.size

    val rowTask = Task.traverse(results.data) { row =>
      consumer.write(Row(queryId, row))
    }

    Task.sequence(Seq(columnTask, progressTask, errorTask, rowTask)).map(_ => ())
  }

  def sendErrors(queryId: String, prestoError: BatchError) = {
    lastError = Some(new RuntimeException(prestoError.message))
    consumer.write(Error(queryId, prestoError.message))
  }

  def sendProgress(queryId: String, percentage: Int) = {
    consumer.write(Progress(queryId, percentage))
  }

  override def errorSubQuery(queryId: String, e: Throwable) = {
    lastError = Some(e)
    consumer.write(SubQueryError(queryId, e.getMessage))
  }

  def sendColumns(queryId: String, names: Seq[BatchColumn]) = {
    val sentColumns = sentColumnsPerQuery.contains(queryId)
    if (!sentColumns && names.nonEmpty) {
      sentColumnsPerQuery += queryId
      consumer.write(SubQueryFields(queryId, names.map(_.name)))
    } else Task.unit
  }

  override def rowCount: Long = rows

  override def error(queryId: String, e: Throwable) = {
    lastError = Some(e)
    consumer.write(Error(queryId, e.getMessage))
  }
}
