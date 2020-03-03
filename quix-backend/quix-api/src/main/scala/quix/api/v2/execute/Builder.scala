package quix.api.v2.execute

import monix.eval.Task
import quix.api.v1.execute.Batch

/**
 * Builder is used to propagate messages between AsyncQueryExecutor and quix frontend
 *
 */
trait Builder {

  /** Sent when query is started */
  def start(query: Query): Task[Unit]

  /** Sent when query is ended */
  def end(query: Query): Task[Unit]

  /** Sent when query fails with exception */
  def error(queryId: String, e: Throwable): Task[Unit]

  /** Total counter of all rows */
  def rowCount: Long

  def lastError: Option[Throwable]

  /** Sent of every sub query start, each subquery will be shown in different tab in quix */
  def startSubQuery(subQueryId: String, code: String): Task[Unit]

  /** Used to stream results back to quix frontend */
  def addSubQuery(subQueryId: String, results: Batch): Task[Unit]

  /** Sent of every sub query end, quix frontend will use it to stop populating currect tab */
  def endSubQuery(subQueryId: String, stats: Map[String, Any] = Map.empty): Task[Unit]

  def errorSubQuery(subQueryId: String, e: Throwable): Task[Unit]

  /** Used to send different log messages.
   *
   * @param line  message to log
   * @param level supported levels are INFO and ERROR
   **/
  def log(subQueryId: String, line: String, level: String = "INFO"): Task[Unit]
}
