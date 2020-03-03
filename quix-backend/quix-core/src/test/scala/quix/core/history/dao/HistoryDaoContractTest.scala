package quix.core.history.dao

import java.time.{Clock, Instant, ZoneOffset}

import cats.effect.Resource
import cats.syntax.apply._
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import org.specs2.mutable.SpecificationWithJUnit
import quix.api.v1.users.User
import quix.api.v2.execute.{ImmutableSubQuery, Query}
import quix.core.history.ExecutionMatchers._
import quix.core.history.dao.HistoryDaoContractTest._
import quix.core.history.{Execution, ExecutionStatus, FakeClock}

import scala.concurrent.duration._

trait HistoryDaoContractTest extends SpecificationWithJUnit {

  def createDao(clock: Clock = defaultClock): Resource[Task, HistoryWriteDao with HistoryReadDao]

  "return empty list of executions if none was saved" in {
    val result = createDao().use(_.executions())

    result.runSyncUnsafe() must beEmpty
  }

  "return running execution" in {
    val result = createDao().use { dao =>
      dao.executionStarted(query, queryType) *>
        dao.executions()
    }

    result.runSyncUnsafe() must contain(
      Execution(
        id = "query-id",
        queryType = queryType,
        statements = statements,
        user = user,
        startedAt = now,
        status = ExecutionStatus.Running))
  }

  "return succeeded execution" in {
    val result = createDao().use { dao =>
      dao.executionStarted(query, queryType) *>
        dao.executionSucceeded(queryId) *>
        dao.executions()
    }

    result.runSyncUnsafe() must
      contain(executionWithStatus(ExecutionStatus.Finished))
  }

  "return failed execution" in {
    val error = new RuntimeException("oops")
    val result = createDao().use { dao =>
      dao.executionStarted(query, queryType) *>
        dao.executionFailed(queryId, error) *>
        dao.executions()
    }

    result.runSyncUnsafe() must
      contain(executionWithStatus(ExecutionStatus.Failed))
  }

  "support paging" in {
    val query1 = query.copy(id = "query-1")
    val query2 = query.copy(id = "query-2")
    val query3 = query.copy(id = "query-3")
    val query4 = query.copy(id = "query-4")
    val query5 = query.copy(id = "query-5")

    val result = createDao().use { dao =>
      for {
        _ <- dao.executionStarted(query1, queryType)
        _ <- dao.executionStarted(query2, queryType)
        _ <- dao.executionStarted(query3, queryType)
        _ <- dao.executionStarted(query4, queryType)
        _ <- dao.executionStarted(query5, queryType)
        page1 <- dao.executions(page = Page(0, 3))
        page2 <- dao.executions(page = Page(3, 3))
      } yield (page1, page2)
    }

    result.runSyncUnsafe() must beLike {
      case (page1, page2) =>
        (page1 must contain(exactly(executionWithId(query1.id), executionWithId(query2.id), executionWithId(query3.id)))) and
          (page2 must contain(exactly(executionWithId(query4.id), executionWithId(query5.id))))
    }
  }

  "support filtering by status" in {
    val query1 = query.copy(id = "query-1")
    val query2 = query.copy(id = "query-2")
    val query3 = query.copy(id = "query-3")

    val result = createDao().use { dao =>
      for {
        _ <- dao.executionStarted(query1, queryType)
        _ <- dao.executionStarted(query2, queryType)
        _ <- dao.executionStarted(query3, queryType)
        _ <- dao.executionSucceeded(query2.id)
        _ <- dao.executionFailed(query3.id, new RuntimeException)
        running <- dao.executions(filter = Filter.Status(ExecutionStatus.Running))
        finished <- dao.executions(filter = Filter.Status(ExecutionStatus.Finished))
        failed <- dao.executions(filter = Filter.Status(ExecutionStatus.Failed))
      } yield (running, finished, failed)
    }

    result.runSyncUnsafe() must beLike {
      case (running, finished, failed) =>
        (running must contain(exactly(executionWithId(query1.id)))) and
          (finished must contain(exactly(executionWithId(query2.id)))) and
          (failed must contain(exactly(executionWithId(query3.id))))
    }
  }

  "support sorting by start time" in {
    val clock = FakeClock(now)
    val query1 = query.copy(id = "query-1")
    val query2 = query.copy(id = "query-2")

    val result = createDao(clock).use { dao =>
      for {
        _ <- dao.executionStarted(query1, queryType)
        _ <- Task(clock.sleep(1.second))
        _ <- dao.executionStarted(query2, queryType)
        ascending <- dao.executions(sort = Sort(SortField.StartTime, SortOrder.Ascending))
        descending <- dao.executions(sort = Sort(SortField.StartTime, SortOrder.Descending))
      } yield (ascending, descending)
    }

    result.runSyncUnsafe() must beLike {
      case (ascending, descending) =>
        (ascending must contain(exactly(executionWithId(query1.id), executionWithId(query2.id)).inOrder)) and
          (descending must contain(exactly(executionWithId(query2.id), executionWithId(query1.id)).inOrder))
    }
  }

}

object HistoryDaoContractTest {
  val now = Instant.ofEpochMilli(0)
  val defaultClock = Clock.fixed(now, ZoneOffset.UTC)
  val queryType = "query-type"
  val user = User("foo@bar.com", "some-user")
  val queryId = "query-id"

  val query1 = ImmutableSubQuery("code1", user)
  val query2 = ImmutableSubQuery("code2", user)
  val query = Query(Seq(query1, query2), id = queryId)
  val statements = query.subQueries.map(_.text)
}
