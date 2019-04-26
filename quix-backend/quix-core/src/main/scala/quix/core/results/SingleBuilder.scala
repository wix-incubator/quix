package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.{ActiveQuery, Builder, Batch, BatchColumn}

import scala.collection.mutable.ListBuffer

class SingleBuilder extends Builder[Batch] with LazyLogging {

  private val rows = ListBuffer.empty[Seq[Any]]
  private val headers = ListBuffer.empty[BatchColumn]
  private var failureCause: Option[Throwable] = None

  def build(): List[Seq[Any]] = rows.toList

  override def errorSubQuery(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
  }

  override def startSubQuery(queryId: String, code: String, results: Batch) = Task {
    addSubQuery(queryId, results)
  }

  override def addSubQuery(queryId: String, results: Batch) = Task {
    results.error foreach { error =>
      failureCause = Option(new RuntimeException(error.message))
    }

    for {
      newHeaders <- results.columns if headers.isEmpty
    } headers ++= newHeaders

    rows ++= results.data
  }

  override def endSubQuery(queryId: String) = Task.unit

  override def start(query: ActiveQuery) = Task.unit

  override def end(query: ActiveQuery) = Task.unit

  def isFailure = failureCause.isDefined

  override def rowCount: Long = rows.size

  override def lastError: Option[Throwable] = failureCause

  override def error(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
  }
}