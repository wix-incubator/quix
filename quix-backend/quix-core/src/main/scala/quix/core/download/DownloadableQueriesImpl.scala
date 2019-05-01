package quix.core.download

import java.util.concurrent.ConcurrentHashMap

import com.typesafe.scalalogging.LazyLogging
import quix.api.execute._

case class DownloadConfig(waitTimeForDownloadInMillis: Long)

class DownloadableQueriesImpl[Code](val downloadConfig: DownloadConfig = DownloadConfig(1000L * 30))
  extends DownloadableQueries[Code, Batch, ExecutionEvent] with LazyLogging {

  import scala.collection.JavaConverters._

  private val queries = new ConcurrentHashMap[String, DownloadableQuery]().asScala

  override def get(queryId: String): Option[DownloadableQuery] = queries.get(queryId)

  override def remove(queryId: String): Unit = {
    logger.info(s"event=remove query-id=$queryId")
    queries.remove(queryId)
  }

  override def add(query: DownloadableQuery): Unit = {
    logger.info(s"event=add query-id=${query.id}")
    queries.put(query.id, query)
  }

  override def adapt(delegate: Builder[Code, Batch], consumer: Consumer[ExecutionEvent]): Builder[Code, Batch] = {
    new DownloadBuilder(delegate, this, consumer, downloadConfig)
  }
}
