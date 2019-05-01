package quix.api.execute

import monix.eval.Task
import quix.api.users.User

case class ActiveQuery(id: String,
                       var text: String,
                       numOfQueries: Int,
                       user: User,
                       var isCancelled: Boolean,
                       var session: Map[String, Any],
                       var catalog: Option[String] = None,
                       var schema: Option[String] = None)

trait Builder[Results] {
  def start(query: ActiveQuery): Task[Unit]

  def end(query: ActiveQuery): Task[Unit]

  def error(queryId: String, e: Throwable): Task[Unit]

  def rowCount: Long

  def lastError: Option[Throwable]

  def startSubQuery(queryId: String, code: String, results: Results): Task[Unit]

  def addSubQuery(queryId: String, results: Results): Task[Unit]

  def endSubQuery(queryId: String): Task[Unit]

  def errorSubQuery(queryId: String, e: Throwable): Task[Unit]
}

trait Executions[Code, Results] {
  def execute(statements: Seq[Code], user: User, resultBuilder: Builder[Results]): Task[Unit]

  def kill(queryId: String, user: User): Task[Unit]
}

trait AsyncQueryExecutor[Results] {
  def runTask(query: ActiveQuery, builder: Builder[Results]): Task[Unit]
}