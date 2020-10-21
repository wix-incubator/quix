package quix.core.history

import cats.syntax.apply._
import monix.eval.Task
import quix.api.v1.execute.Batch
import quix.api.v2.execute.{Builder, Query}
import quix.core.history.dao.HistoryWriteDao

class HistoryBuilder[Results](delegate: Builder,
                              historyWriteDao: HistoryWriteDao,
                              queryType: String)
  extends Builder {

  override def start(query: Query): Task[Unit] =
    delegate.start(query) *> historyWriteDao.executionStarted(query, queryType)

  override def end(query: Query): Task[Unit] =
    delegate.end(query) *> historyWriteDao.executionSucceeded(query.id)

  override def error(queryId: String, e: Throwable): Task[Unit] =
    delegate.error(queryId, e) *> historyWriteDao.executionFailed(queryId, e)

  override def rowCount: Long =
    delegate.rowCount

  override def lastError: Option[Throwable] =
    delegate.lastError

  override def startSubQuery(subQueryId: String, code: String): Task[Unit] =
    delegate.startSubQuery(subQueryId, code)

  override def addSubQuery(subQueryId: String, results: Batch): Task[Unit] =
    delegate.addSubQuery(subQueryId, results)

  override def endSubQuery(subQueryId: String, stats: Map[String, Any]): Task[Unit] =
    delegate.endSubQuery(subQueryId, stats)

  override def errorSubQuery(subQueryId: String, e: Throwable): Task[Unit] =
    delegate.errorSubQuery(subQueryId, e)

  override def log(subQueryId: String, line: String, level: String): Task[Unit] =
    delegate.log(subQueryId, line, level)

}
