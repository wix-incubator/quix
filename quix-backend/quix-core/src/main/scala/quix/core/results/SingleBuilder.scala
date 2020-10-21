package quix.core.results

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v1.execute.{Batch, BatchColumn}
import quix.api.v2.execute.{Builder, Query, SubQuery}

import scala.collection.mutable.ListBuffer

/** SingleBuilder accepts rows and stores them in memory in order of their arrival.
 * SingleBuilder is used by internal quix-backend processes such as db-tree traversal
 * or E2E tests. To receive the rows collected so far, one must call builder.build() */
class SingleBuilder extends Builder with LazyLogging {

  private val rows = ListBuffer.empty[Seq[Any]]
  private val headers = ListBuffer.empty[BatchColumn]
  private var failureCause: Option[Throwable] = None
  private var logMessages = ListBuffer.empty[String]
  private var statistics = Map.empty[String, Any]

  /**
   * @returns the rows collected so far */
  def build(): List[Seq[Any]] = rows.toList

  override def errorSubQuery(subQueryId: String, e: Throwable) = Task {
    failureCause = Option(e)
  }

  override def startSubQuery(subQueryId: String, code : String) = Task.unit

  override def addSubQuery(subQueryId: String, results: Batch) = handleBatch(results)

  def handleBatch(batch: Batch): Task[Unit] = Task {
    batch.error foreach { error =>
      failureCause = Option(new RuntimeException(error.message))
    }

    for {
      newHeaders <- batch.columns if headers.isEmpty
    } headers ++= newHeaders

    rows ++= batch.data
  }

  override def endSubQuery(subQueryId: String, stats : Map[String, Any]) = Task {
    this.statistics = stats
  }

  override def start(query: Query) = Task.unit

  override def end(query: Query) = Task.unit

  def isFailure = failureCause.isDefined

  override def rowCount: Long = rows.size

  override def lastError: Option[Throwable] = failureCause

  override def error(queryId: String, e: Throwable) = Task {
    failureCause = Option(e)
  }

  def columns = headers.toList

  override def log(subQueryId: String, line: String, level: String): Task[Unit] = Task {
    logMessages += line
  }

  def logs = logMessages.toList
}