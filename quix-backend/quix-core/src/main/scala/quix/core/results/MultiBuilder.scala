package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.Batch._
import quix.api.execute._

/** MultiBuilder accepts Consumer[ExecutionEvent] and propagates to it different events from lifecycle of Builder.
 * For example, {{{start(query: ActiveQuery[Code])}}} will produce {{{Start(query.id, query.statements.size)}}}
 * */
class MultiBuilder[Code](val consumer: Consumer[ExecutionEvent])
  extends Builder[Code, Batch] with LazyLogging {

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
    val resetCount = Task(this.rows = 0L)
    val startTask = consumer.write(SubQueryStart(queryId))
    val detailsTask = consumer.write(SubQueryDetails[Code](queryId, code))
    val subqueryTask = addSubQuery(queryId, results)

    Task.sequence(List(resetCount, startTask, detailsTask, subqueryTask)).map(_ => ())
  }

  override def endSubQuery(queryId: String, statistics: Map[String, Any]) = {
    consumer.write(SubQueryEnd(queryId, statistics))
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
    val errorMessage = makeErrorMessage(e)
    consumer.write(SubQueryError(queryId, errorMessage))
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

  override def log(queryId: String, line: String, level: String): Task[Unit] = {
    consumer.write(Log(queryId, line, level))
  }
}
