package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.{ActiveQuery, Builder, Batch, BatchColumn}

import scala.collection.mutable.ListBuffer

class SingleBuilder extends Builder[Batch] with LazyLogging {

  private val rows = ListBuffer.empty[Seq[Any]]
  private val headers = ListBuffer.empty[BatchColumn]
  private var failureCause: Option[Throwable] = None

  def logResults(results: Batch) = {
    val stats = results.stats

    logger.info(s"rows=${results.data.size} stats=$stats")
  }

  def build(): List[Seq[Any]] = rows.toList

  def getHeaders: Seq[BatchColumn] = headers.toList

  override def errorSubQuery(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
    logger.error("Got exception", e)
  }

  override def startSubQuery(queryId: String, code: String, results: Batch) = Task {
    addSubQuery(queryId, results)
  }

  override def addSubQuery(queryId: String, results: Batch) = Task {
    logResults(results)

    results.error foreach { error =>
      failureCause = Option(new RuntimeException(error.message))
    }

    results.columns foreach {
      case newHeaders if headers.isEmpty => headers ++= newHeaders
      case _ =>
    }

    results.data foreach { row =>
      rows += row
    }
  }

  override def endSubQuery(queryId: String) = Task.unit

  override def start(query: ActiveQuery) = Task.unit

  override def end(query: ActiveQuery) = Task.unit

  def isFailure = failureCause.isDefined

  def getFailureCause = failureCause.get

  override def rowCount: Long = rows.size

  override def lastError: Option[Throwable] = failureCause

  override def error(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
    logger.error("Got exception", e)
  }
}