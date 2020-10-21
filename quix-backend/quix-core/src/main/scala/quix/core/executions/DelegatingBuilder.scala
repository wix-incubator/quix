package quix.core.executions

import quix.api.v1.execute.Batch
import quix.api.v2.execute._

abstract class DelegatingBuilder(val delegate: Builder) extends Builder {

  override def start(query: Query) =
    delegate.start(query)

  override def end(query: Query) =
    delegate.end(query)

  override def error(queryId: String, e: Throwable) =
    delegate.error(queryId, e)

  override def rowCount: Long =
    delegate.rowCount

  override def lastError: Option[Throwable] =
    delegate.lastError

  override def startSubQuery(subQueryId: String, code: String) =
    delegate.startSubQuery(subQueryId, code)

  override def addSubQuery(subQueryId: String, results: Batch) =
    delegate.addSubQuery(subQueryId, results)

  override def endSubQuery(subQueryId: String, stats: Map[String, Any]) =
    delegate.endSubQuery(subQueryId, stats)

  override def errorSubQuery(subQueryId: String, e: Throwable) =
    delegate.errorSubQuery(subQueryId, e)

  override def log(subQueryId: String, line: String, level: String) =
    delegate.log(subQueryId, line, level)
}