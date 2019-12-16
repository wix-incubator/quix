package quix.api.execute

import monix.eval.Task
import quix.api.users.User


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
 * @tparam Code designates type of incoming code, usually String
 * @tparam Results designates type of outgoing messages, usually [[quix.api.execute.Batch]]
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
  def startSubQuery(queryId: String, code: Code, results: Results): Task[Unit]

  def addSubQuery(queryId: String, results: Results): Task[Unit]

  /** Sent of every sub query end, quix frontend will use it to stop populating currect tab */
  def endSubQuery(queryId: String): Task[Unit]

  def errorSubQuery(queryId: String, e: Throwable): Task[Unit]

  /** Used to send different log messages.
   *
   * @param line message to log
   * @param level supported levels are INFO and ERROR
   *  */
  def log(queryId: String, line: String, level: String = "INFO"): Task[Unit]
}

trait Executions[Code, Results] {
  def execute(statements: Seq[Code], user: User, resultBuilder: Builder[Code, Results]): Task[Unit]

  def kill(queryId: String, user: User): Task[Unit]
}

trait AsyncQueryExecutor[Code, Results] {
  def runTask(query: ActiveQuery[Code], builder: Builder[Code, Results]): Task[Unit]
}