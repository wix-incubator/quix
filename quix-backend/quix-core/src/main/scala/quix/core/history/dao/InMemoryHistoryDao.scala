package quix.core.history.dao

import java.time.Clock

import cats.effect.concurrent.Ref
import monix.eval.Task
import quix.api.v2.execute.Query
import quix.core.history.dao.InMemoryHistoryDao.{comparator, predicate}
import quix.core.history.{Execution, ExecutionStatus}

case class InMemoryHistoryDao(state: Ref[Task, Map[String, Execution]], clock: Clock)
  extends HistoryWriteDao with HistoryReadDao {

  private val instant = Task(clock.instant)

  override def executionStarted(query: Query, queryType: String): Task[Unit] =
    instant.flatMap { now =>
      val execution = Execution(
        id = query.id,
        queryType = queryType,
        statements = query.subQueries.map(_.text),
        user = query.subQueries.map(_.user).head,
        startedAt = now,
        status = ExecutionStatus.Running)

      state.update(_ + (query.id -> execution))
    }

  override def executionSucceeded(queryId: String): Task[Unit] =
    update(queryId, _.copy(status = ExecutionStatus.Finished))

  override def executionFailed(queryId: String, error: Throwable): Task[Unit] =
    update(queryId, _.copy(status = ExecutionStatus.Failed))

  override def executions(filter: Filter, sort: Sort, page: Page): Task[List[Execution]] =
    state.get.map { map =>
      map.values.toList
        .filter(predicate(filter))
        .sortWith(comparator(sort))
        .slice(page.offset, page.endOffset)
    }

  private def update(queryId: String, f: Execution => Execution): Task[Unit] =
    state.update { map =>
      map.get(queryId).fold(map) { execution =>
        map + (queryId -> f(execution))
      }
    }

}

object InMemoryHistoryDao {
  def make(clock: Clock): Task[InMemoryHistoryDao] =
    Ref.of[Task, Map[String, Execution]](Map.empty).map(InMemoryHistoryDao(_, clock))

  def predicate(filter: Filter)(execution: Execution): Boolean = filter match {
    case Filter.None => true

    case Filter.Status(status) =>
      execution.status == status

    case Filter.User(email) =>
      execution.user.email == email

    case Filter.Query(text) =>
      execution.statements.exists(_.contains(text))

    case Filter.CompoundFilter(filters) =>
      filters.forall(filter => predicate(filter)(execution))
  }

  def comparator(sort: Sort)(e1: Execution, e2: Execution): Boolean = sort match {
    case Sort(SortField.StartTime, SortOrder.Ascending) =>
      e1.startedAt isBefore e2.startedAt

    case Sort(SortField.StartTime, SortOrder.Descending) =>
      e1.startedAt isAfter e2.startedAt
  }
}
