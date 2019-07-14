package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.{ActiveQuery, Batch, BatchColumn, Builder}

import scala.collection.mutable.ListBuffer

class SingleBuilder[Code] extends Builder[Code, Batch] with LazyLogging {

  private val rows = ListBuffer.empty[Seq[Any]]
  private val headers = ListBuffer.empty[BatchColumn]
  private var failureCause: Option[Throwable] = None

  def build(): List[Seq[Any]] = rows.toList

  override def errorSubQuery(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
  }

  override def startSubQuery(queryId: String, code: Code, results: Batch) = handleBatch(results)

  override def addSubQuery(queryId: String, results: Batch) = handleBatch(results)

  def handleBatch(batch: Batch) : Task[Unit] = Task {
    batch.error foreach { error =>
      failureCause = Option(new RuntimeException(error.message))
    }

    for {
      newHeaders <- batch.columns if headers.isEmpty
    } headers ++= newHeaders

    rows ++= batch.data
  }

  override def endSubQuery(queryId: String) = Task.unit

  override def start(query: ActiveQuery[Code]) = Task.unit

  override def end(query: ActiveQuery[Code]) = Task.unit

  def isFailure = failureCause.isDefined

  override def rowCount: Long = rows.size

  override def lastError: Option[Throwable] = failureCause

  override def error(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
  }

  def columns = headers.toList
}