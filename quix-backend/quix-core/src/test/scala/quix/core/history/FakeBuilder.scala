package quix.core.history

import cats.effect.concurrent.Ref
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import quix.api.execute.{ActiveQuery, Batch, Builder}

case class FakeBuilder(state: Ref[Task, State]) extends Builder[String, Batch] {

  override def start(query: ActiveQuery[String]): Task[Unit] =
    state.update(_.start(query))

  override def end(query: ActiveQuery[String]): Task[Unit] =
    state.update(_.end(query))

  override def error(queryId: String, e: Throwable): Task[Unit] =
    state.update(_.error(queryId, e))

  override def rowCount: Long = get(_.rows)

  override def lastError: Option[Throwable] = get(_.lastError)

  override def startSubQuery(queryId: String, code: String, results: Batch): Task[Unit] =
    state.update(_.startSubQuery(queryId, code, results))

  override def addSubQuery(queryId: String, results: Batch): Task[Unit] =
    state.update(_.addSubQuery(queryId, results))

  override def endSubQuery(queryId: String): Task[Unit] =
    state.update(_.endSubQuery(queryId))

  override def errorSubQuery(queryId: String, e: Throwable): Task[Unit] =
    state.update(_.error(queryId, e))

  override def log(queryId: String, line: String, level: String): Task[Unit] =
    state.update(_.addLogLine(queryId, line, level))

  private def get[A](f: State => A): A =
    state.get.map(f).runSyncUnsafe()

}

object FakeBuilder {
  def make: Task[FakeBuilder] =
    Ref.of[Task, State](State.Empty).map(FakeBuilder(_))
}

case class State(queries: Map[String, Query],
                 subQueries: Map[String, SubQuery],
                 errors: List[Error],
                 log: List[LogLine]) {

  def rows: Long = subQueries.values.foldLeft(0L)(_ + _.rows)

  def start(query: ActiveQuery[String]): State =
    copy(queries = queries + (query.id -> Query(query, QueryStatus.Started)))

  def end(query: ActiveQuery[String]): State =
    copy(queries = queries + (query.id -> Query(query, QueryStatus.Ended)))

  def error(queryId: String, e: Throwable): State =
    copy(errors = Error(queryId, e) :: errors)

  def lastError: Option[Throwable] =
    errors.headOption.map(_.error)

  def startSubQuery(queryId: String, code: String, results: Batch): State =
    copy(subQueries = subQueries + (queryId -> SubQuery(code, results)))

  def addSubQuery(queryId: String, results: Batch): State =
    copy(subQueries = updateSubQuery(queryId, _.addResults(results)))

  def endSubQuery(queryId: String): State =
    copy(subQueries = updateSubQuery(queryId, _.ended))

  def addLogLine(queryId: String, line: String, level: String): State =
    copy(log = LogLine(queryId, line, level) :: log)

  private def updateSubQuery(queryId: String, f: SubQuery => SubQuery): Map[String, SubQuery] =
    subQueries.get(queryId).fold(subQueries)(query => subQueries + (queryId -> f(query)))
}

object State {
  val Empty = State(Map.empty, Map.empty, Nil, Nil)
}

sealed trait QueryStatus

object QueryStatus {
  case object Started extends QueryStatus
  case object Ended extends QueryStatus
}

case class Query(query: ActiveQuery[String], status: QueryStatus)

case class SubQuery(code: String,
                    results: List[Batch],
                    status: QueryStatus) {

  def rows: Long = results.foldLeft(0L)(_ + _.data.size)

  def addResults(moreResults: Batch): SubQuery =
    copy(results = moreResults :: results)

  def ended: SubQuery =
    copy(status = QueryStatus.Ended)

}

object SubQuery {
  def apply(code: String, results: Batch): SubQuery =
    SubQuery(code, List(results), QueryStatus.Started)
}

case class Error(queryId: String, error: Throwable)

case class LogLine(queryId: String, line: String, level: String)
