package quix.core.history.dao

import java.time.Clock

import cats.effect.concurrent.Ref
import monix.eval.Task
import quix.api.execute.ActiveQuery
import quix.core.history.{Execution, ExecutionStatus}

case class InMemoryHistoryDao(state: Ref[Task, Map[String, Execution]], clock: Clock)
  extends HistoryWriteDao with HistoryReadDao {

  private val instant = Task(clock.instant)

  override def executionStarted(query: ActiveQuery[String], queryType: String): Task[Unit] =
    instant.flatMap { now =>
      val execution = Execution(
        id = query.id,
        queryType = queryType,
        statements = query.statements,
        user = query.user,
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
      map.values
        .toList
        .filter { execution =>
          filter match {
            case Filter.None => true
            case Filter.Status(status) => execution.status == status
          }
        }
        .sortBy { execution =>
          sort.by match {
            case SortField.StartTime => execution.startedAt
          }
        }
        .slice(page.offset, page.offset + page.limit)
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
}
