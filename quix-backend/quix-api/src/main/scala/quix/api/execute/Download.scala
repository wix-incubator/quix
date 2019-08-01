package quix.api.execute

import java.util.concurrent.{BlockingQueue, CountDownLatch}

sealed trait DownloadPayload

case class DownloadableRow(values: Seq[Any]) extends DownloadPayload

case class ErrorDuringDownload(message: String) extends DownloadPayload

case class DownloadableQuery(id: String, results: BlockingQueue[DownloadPayload], var isRunning: Boolean = true, latch: CountDownLatch)

trait DownloadableQueries[Code, Results, Message] {
  def get(queryId: String): Option[DownloadableQuery]

  def remove(queryId: String): Unit

  def add(runningQuery: DownloadableQuery): Unit

  def adapt(delegate: Builder[Code, Results], consumer: Consumer[Message]): Builder[Code, Results]
}


