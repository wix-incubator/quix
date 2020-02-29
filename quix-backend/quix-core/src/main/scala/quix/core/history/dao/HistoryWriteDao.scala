package quix.core.history.dao

import monix.eval.Task
import quix.api.v1.execute.ActiveQuery

trait HistoryWriteDao {
  def executionStarted(query: ActiveQuery[String], queryType: String): Task[Unit]
  def executionSucceeded(queryId: String): Task[Unit]
  def executionFailed(queryId: String, error: Throwable): Task[Unit]
}
