package quix.core.history

import java.time.{Clock, Instant, ZoneOffset}

import monix.execution.Scheduler.Implicits.global
import org.specs2.mutable.SpecificationWithJUnit
import quix.api.v1.execute.Batch
import quix.api.v1.users.User
import quix.api.v2.execute.{ImmutableSubQuery, Query}
import quix.core.history.ExecutionMatchers._
import quix.core.history.HistoryBuilderTest._
import quix.core.history.dao.InMemoryHistoryDao

class HistoryBuilderTest extends SpecificationWithJUnit {

  val subQuery = "query3"
  val now = Instant.ofEpochMilli(0)
  val clock = Clock.fixed(now, ZoneOffset.UTC)
  val makeDao = InMemoryHistoryDao.make(clock)

  "delegate calls to internal builder" in {
    val result = for {
      delegate <- FakeBuilder.make
      dao <- makeDao
      builder = new HistoryBuilder(delegate, dao, queryType)
      _ <- builder.start(query1)
      _ <- builder.startSubQuery(subQuery, code1.text)
      _ <- builder.addSubQuery(subQuery, batch1)
      _ <- builder.addSubQuery(subQuery, batch2)
      _ <- builder.endSubQuery(subQuery)
      _ <- builder.end(query1)
      _ <- builder.start(query2)
      _ <- builder.log(query2.id, "some-log")
      _ <- builder.error(query2.id, error1)
      _ <- builder.errorSubQuery(subQuery, error2)
      state <- delegate.state.get
    } yield state

    result.runSyncUnsafe() must
      equalTo(
        State(
          queries = Map(
            query1.id -> HistoricalQuery(query1, QueryStatus.Ended),
            query2.id -> HistoricalQuery(query2, QueryStatus.Started)),
          subQueries = Map(subQuery -> HistoricalSubQuery(code1.text, List(batch2, batch1), QueryStatus.Ended)),
          errors = List(Error(subQuery, error2), Error(query2.id, error1)),
          log = List(LogLine(query2.id, "some-log", "INFO"))))
  }

  "persist execution history" in {
    val result = for {
      delegate <- FakeBuilder.make
      dao <- makeDao
      builder = new HistoryBuilder(delegate, dao, queryType)
      _ <- builder.start(query1)
      _ <- builder.end(query1)
      executions <- dao.executions()
    } yield executions

    result.runSyncUnsafe() must
      contain(executionWithStatus(ExecutionStatus.Finished))
  }

  "persist failed execution" in {
    val error = new RuntimeException("oops")
    val result = for {
      delegate <- FakeBuilder.make
      dao <- makeDao
      builder = new HistoryBuilder(delegate, dao, queryType)
      _ <- builder.start(query1)
      _ <- builder.error(query1.id, error)
      executions <- dao.executions()
    } yield executions

    result.runSyncUnsafe() must
      contain(executionWithStatus(ExecutionStatus.Failed))
  }

}

object HistoryBuilderTest {
  val user = User("foo@bar.com", "some-user")
  val code1 = ImmutableSubQuery("code1", user)
  val code2 = ImmutableSubQuery("code2", user)
  val code3 = ImmutableSubQuery("code3", user)
  val queryType = "query-type"
  val query1 = Query(List(code1, code2), id = "query1")
  val query2 = Query(List(code3), id = "query2")
  val batch1 = Batch(List(List(1), List(2)))
  val batch2 = Batch(List(List(3)))
  val error1 = new RuntimeException("foo")
  val error2 = new RuntimeException("bar")
}
