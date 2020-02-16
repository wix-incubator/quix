package quix.core.executions

import quix.api.execute._

abstract class DelegatingBuilder[Code, Results](val delegate : Builder[Code, Results]) extends Builder[Code, Results] {
  override def start(query: ActiveQuery[Code]) = 
    delegate.start(query)

  override def end(query: ActiveQuery[Code]) = 
    delegate.end(query)

  override def error(queryId: String, e: Throwable) = 
    delegate.error(queryId, e)

  override def rowCount: Long = 
    delegate.rowCount

  override def lastError: Option[Throwable] = 
    delegate.lastError

  override def startSubQuery(queryId: String, code: Code, results: Results) = 
    delegate.startSubQuery(queryId, code, results)

  override def addSubQuery(queryId: String, results: Results) =
    delegate.addSubQuery(queryId, results)

  override def endSubQuery(queryId: String, statistics: Map[String, Any]) =
    delegate.endSubQuery(queryId, statistics)

  override def errorSubQuery(queryId: String, e: Throwable) =
    delegate.errorSubQuery(queryId, e)

  override def log(queryId: String, line: String, level: String) =
    delegate.log(queryId, line, level)
}