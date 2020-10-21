package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v1.execute.Batch._
import quix.api.v1.execute.{Batch, BatchColumn, BatchError, Consumer, End, Error, ExceptionPropagatedToClient, ExecutionEvent, Log, Progress, Row, Start, SubQueryDetails, SubQueryEnd, SubQueryError, SubQueryFields, SubQueryStart}
import quix.api.v2.execute._

/** MultiBuilder accepts Consumer[ExecutionEvent] and propagates to it different events from lifecycle of Builder.
 * For example, {{{start(query: Execution)}}} will produce {{{Start(query.id, query.statements.size)}}}
 * */
class MultiBuilder(val consumer: Consumer[ExecutionEvent])
  extends Builder with LazyLogging {

  var rows = 0L
  val sentColumnsPerQuery = collection.mutable.Set.empty[String]
  var lastError: Option[Throwable] = None

  override def start(query: Query) = {
    consumer.write(Start(query.id, query.subQueries.size))
  }

  override def end(query: Query) = {
    consumer.write(End(query.id))
  }

  override def startSubQuery(subQueryId: String, code : String) = {
    val resetCount = Task(this.rows = 0L)
    val startTask = consumer.write(SubQueryStart(subQueryId))
    val detailsTask = consumer.write(SubQueryDetails(subQueryId, code))

    Task.sequence(List(resetCount, startTask, detailsTask)).map(_ => ())
  }

  override def endSubQuery(subQueryId : String, stats : Map[String, Any]) = {
    consumer.write(SubQueryEnd(subQueryId, stats))
  }

  override def addSubQuery(subQueryId : String, results: Batch) = {
    val columnTask: Task[Unit] = results.columns.map(columns => sendColumns(subQueryId, columns)).getOrElse(Task.unit)
    val progressTask: Task[Unit] = results.percentage.map(percentage => sendProgress(subQueryId, percentage)).getOrElse(Task.unit)
    val errorTask: Task[Unit] = results.error.map(error => sendErrors(subQueryId, error)).getOrElse(Task.unit)

    rows += results.data.size

    val rowTask = Task.traverse(results.data) { row =>
      consumer.write(Row(subQueryId, row))
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

  override def errorSubQuery(subQueryId: String, e: Throwable) = {
    lastError = Some(e)
    val errorMessage = makeErrorMessage(e)
    consumer.write(SubQueryError(subQueryId, errorMessage))
  }

  private def makeErrorMessage(e: Throwable) = {
    e match {
      case ExceptionPropagatedToClient(message) => message
      case _ => s"${e.getClass.getSimpleName}(${e.getMessage})"
    }
  }

  /** Sends to consumer SubQueryFields on every unique queryId.
   * Every query can have only single list of columns, so no duplications are allowed.
   *  */
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
    val errorMessage = makeErrorMessage(e)
    consumer.write(Error(queryId, errorMessage))
  }

  override def log(subQueryId: String, line: String, level: String): Task[Unit] = {
    consumer.write(Log(subQueryId, line, level))
  }
}
