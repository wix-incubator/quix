package quix.api.v1.execute

import java.util.concurrent.{BlockingQueue, CountDownLatch}

sealed trait DownloadPayload

case class DownloadableRow(values: Seq[Any]) extends DownloadPayload

case class ErrorDuringDownload(message: String) extends DownloadPayload

/** Downloadable query with blocking queue to stream rows of data
 *
 * @param id queryId
 * @param results blocking queue used for communication with consumer
 * @param isRunning flag used to stop the query if needed
 * @param latch countdown latch to pause execution until consumer is ready
 */
case class DownloadableQuery(id: String, results: BlockingQueue[DownloadPayload], var isRunning: Boolean = true, latch: CountDownLatch)

/** Used to support downloadable results for every [[quix.api.v1.execute.Builder]] and [[quix.api.v1.execute.Consumer]]
 * types
 *
 */
trait DownloadableQueries[Code, Results, Message] {
  /** Call to fetch instance of [[quix.api.v1.execute.DownloadableQuery]]
   *
   * @param queryId
   * @return instance of [[quix.api.v1.execute.DownloadableQuery]] if queryId is executed at this moment
   */
  def get(queryId: String): Option[DownloadableQuery]

  /** Call when query is finished to release the resources */
  def remove(queryId: String): Unit

  /** Call when new query is ready to start downloading */
  def add(runningQuery: DownloadableQuery): Unit

  /** Call to adapt existing builder and consumer to downloadable builder */
  def adapt(delegate: Builder[Code, Results], consumer: Consumer[Message]): Builder[Code, Results]
}


