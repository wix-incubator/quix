package quix.core.history

import cats.effect.concurrent.Ref
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import quix.api.v1.execute.Batch
import quix.api.v2.execute.{Builder, Query}

case class FakeBuilder(state: Ref[Task, State]) extends Builder {

  override def start(query: Query): Task[Unit] =
    state.update(_.start(query))

  override def end(query: Query): Task[Unit] =
    state.update(_.end(query))

  override def error(subQueryId: String, e: Throwable): Task[Unit] =
    state.update(_.error(subQueryId, e))

  override def rowCount: Long = get(_.rows)

  override def lastError: Option[Throwable] = get(_.lastError)

  override def startSubQuery(queryId: String, code: String): Task[Unit] =
    state.update(_.startSubQuery(queryId, code))

  override def addSubQuery(subQueryId: String, results: Batch): Task[Unit] =
    state.update(_.addSubQuery(subQueryId, results))

  override def endSubQuery(subQueryId: String, statistics: Map[String, Any]): Task[Unit] =
    state.update(_.endSubQuery(subQueryId))

  override def errorSubQuery(subQueryId: String, e: Throwable): Task[Unit] =
    state.update(_.error(subQueryId, e))

  override def log(subQueryId: String, line: String, level: String): Task[Unit] =
    state.update(_.addLogLine(subQueryId, line, level))

  private def get[A](f: State => A): A =
    state.get.map(f).runSyncUnsafe()

}

object FakeBuilder {
  def make: Task[FakeBuilder] =
    Ref.of[Task, State](State.Empty).map(FakeBuilder(_))
}

case class State(queries: Map[String, HistoricalQuery],
                 subQueries: Map[String, HistoricalSubQuery],
                 errors: List[Error],
                 log: List[LogLine]) {

  def rows: Long = subQueries.values.foldLeft(0L)(_ + _.rows)

  def start(execution: Query): State =
    copy(queries = queries + (execution.id -> HistoricalQuery(execution, QueryStatus.Started)))

  def end(query: Query): State =
    copy(queries = queries + (query.id -> HistoricalQuery(query, QueryStatus.Ended)))

  def error(queryId: String, e: Throwable): State =
    copy(errors = Error(queryId, e) :: errors)

  def lastError: Option[Throwable] =
    errors.headOption.map(_.error)

  def startSubQuery(queryId: String, code: String): State =
    copy(subQueries = subQueries + (queryId -> SubQuery(code)))

  def addSubQuery(queryId: String, results: Batch): State =
    copy(subQueries = updateSubQuery(queryId, _.addResults(results)))

  def endSubQuery(queryId: String): State =
    copy(subQueries = updateSubQuery(queryId, _.ended))

  def addLogLine(queryId: String, line: String, level: String): State =
    copy(log = LogLine(queryId, line, level) :: log)

  private def updateSubQuery(queryId: String, f: HistoricalSubQuery => HistoricalSubQuery): Map[String, HistoricalSubQuery] =
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

case class HistoricalQuery(query: Query, status: QueryStatus)

case class HistoricalSubQuery(code: String,
                              results: List[Batch],
                              status: QueryStatus) {

  def rows: Long = results.foldLeft(0L)(_ + _.data.size)

  def addResults(moreResults: Batch): HistoricalSubQuery =
    copy(results = moreResults :: results)

  def ended: HistoricalSubQuery =
    copy(status = QueryStatus.Ended)

}

object SubQuery {
  def apply(code: String): HistoricalSubQuery =
    HistoricalSubQuery(code, List.empty, QueryStatus.Started)
}

case class Error(queryId: String, error: Throwable)

case class LogLine(queryId: String, line: String, level: String)
