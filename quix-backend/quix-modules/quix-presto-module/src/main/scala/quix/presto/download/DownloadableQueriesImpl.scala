package quix.presto.download

import java.util.concurrent.ConcurrentHashMap

import com.typesafe.scalalogging.LazyLogging
import quix.api.execute.{Consumer, DownloadableQueries, DownloadableQuery, ResultBuilder}
import quix.presto.PrestoEvent
import quix.presto.rest.Results

class DownloadableQueriesImpl extends DownloadableQueries[Results, PrestoEvent] with LazyLogging {

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

  override def adapt(delegate: ResultBuilder[Results], consumer : Consumer[PrestoEvent]): ResultBuilder[Results] = {
    new DownloadResultBuilder(delegate, this, consumer)
  }
}
