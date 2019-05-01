package quix.api.execute

import monix.eval.Task
import quix.api.users.User

case class ActiveQuery[Code](id: String,
                             var text: Code,
                             numOfQueries: Int,
                             user: User,
                             var isCancelled: Boolean,
                             var session: Map[String, Any],
                             var catalog: Option[String] = None,
                             var schema: Option[String] = None)

trait Builder[Code, Results] {
  def start(query: ActiveQuery[Code]): Task[Unit]

  def end(query: ActiveQuery[Code]): Task[Unit]

  def error(queryId: String, e: Throwable): Task[Unit]

  def rowCount: Long

  def lastError: Option[Throwable]

  def startSubQuery(queryId: String, code: Code, results: Results): Task[Unit]

  def addSubQuery(queryId: String, results: Results): Task[Unit]

  def endSubQuery(queryId: String): Task[Unit]

  def errorSubQuery(queryId: String, e: Throwable): Task[Unit]
}

trait Executions[Code, Results] {
  def execute(statements: Seq[Code], user: User, resultBuilder: Builder[Code, Results]): Task[Unit]

  def kill(queryId: String, user: User): Task[Unit]
}

trait AsyncQueryExecutor[Code, Results] {
  def runTask(query: ActiveQuery[Code], builder: Builder[Code, Results]): Task[Unit]
}