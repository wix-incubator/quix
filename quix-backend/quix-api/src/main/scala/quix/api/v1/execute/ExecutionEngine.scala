package quix.api.v1.execute

import monix.eval.Task
import quix.api.v1.users.User


case class ActiveQuery[Code](id: String,
                             statements: Seq[Code],
                             user: User,
                             var current: Int = 0,
                             var isCancelled: Boolean = false,
                             var session: Map[String, Any] = Map.empty,
                             var catalog: Option[String] = None,
                             var schema: Option[String] = None) {
  def text = statements(current)
}


/**
 * Builder is used to propagate messages between AsyncQueryExecutor and quix frontend
 *
 * @tparam Code    designates type of incoming code, usually String
 * @tparam Results designates type of outgoing messages, usually [[quix.api.v1.execute.Batch]]
 */

trait Builder[Code, Results] {

  /** Sent when query is started */
  def start(query: ActiveQuery[Code]): Task[Unit]

  /** Sent when query is ended */
  def end(query: ActiveQuery[Code]): Task[Unit]

  /** Sent when query fails with exception */
  def error(queryId: String, e: Throwable): Task[Unit]

  /** Total counter of all rows */
  def rowCount: Long

  def lastError: Option[Throwable]

  /** Sent of every sub query start, each subquery will be shown in different tab in quix */
  def startSubQuery(subQueryId: String, code: Code, results: Results): Task[Unit]

  /** Used to stream results back to quix frontend */
  def addSubQuery(subQueryId: String, results: Results): Task[Unit]

  /** Sent of every sub query end, quix frontend will use it to stop populating currect tab */
  def endSubQuery(subQueryId: String, statistics: Map[String, Any] = Map.empty): Task[Unit]

  def errorSubQuery(subQueryId: String, e: Throwable): Task[Unit]

  /** Used to send different log messages.
   *
   * @param line  message to log
   * @param level supported levels are INFO and ERROR
   * */
  def log(queryId: String, line: String, level: String = "INFO"): Task[Unit]
}

/** Used to execute single query and stream the results back to Builder */
trait AsyncQueryExecutor[Code, Results] {
  def runTask(query: ActiveQuery[Code], builder: Builder[Code, Results]): Task[Unit]
}

/** Used to show exceptions in the quix frontend
 *
 * @param message the message will be shown to client as is
 **/
case class ExceptionPropagatedToClient(message: String) extends Exception