package quix.core.history.dao

import monix.eval.Task
import quix.api.v2.execute.Query

trait HistoryWriteDao {
  def executionStarted(query: Query, queryType: String): Task[Unit]

  def executionSucceeded(queryId: String): Task[Unit]

  def executionFailed(queryId: String, error: Throwable): Task[Unit]
}
