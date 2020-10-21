package quix.core.history

import cats.syntax.apply._
import monix.eval.Task
import quix.api.execute.{ActiveQuery, Builder}
import quix.core.history.dao.HistoryWriteDao

class HistoryBuilder[Results](delegate: Builder[String, Results],
                              historyWriteDao: HistoryWriteDao,
                              queryType: String)
  extends Builder[String, Results] {

  override def start(query: ActiveQuery[String]): Task[Unit] =
    delegate.start(query) *> historyWriteDao.executionStarted(query, queryType)

  override def end(query: ActiveQuery[String]): Task[Unit] =
    delegate.end(query) *> historyWriteDao.executionSucceeded(query.id)

  override def error(queryId: String, e: Throwable): Task[Unit] =
    delegate.error(queryId, e) *> historyWriteDao.executionFailed(queryId, e)

  override def rowCount: Long =
    delegate.rowCount

  override def lastError: Option[Throwable] =
    delegate.lastError

  override def startSubQuery(queryId: String, code: String, results: Results): Task[Unit] =
    delegate.startSubQuery(queryId, code, results)

  override def addSubQuery(queryId: String, results: Results): Task[Unit] =
    delegate.addSubQuery(queryId, results)

  override def endSubQuery(queryId: String, statistics: Map[String, Any] = Map.empty): Task[Unit] =
    delegate.endSubQuery(queryId)

  override def errorSubQuery(queryId: String, e: Throwable): Task[Unit] =
    delegate.errorSubQuery(queryId, e)

  override def log(queryId: String, line: String, level: String): Task[Unit] =
    delegate.log(queryId, line, level)

}
