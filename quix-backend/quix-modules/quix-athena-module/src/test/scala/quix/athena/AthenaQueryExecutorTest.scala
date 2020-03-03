package quix.athena

import com.amazonaws.services.athena.model._
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import monix.execution.atomic.Atomic
import org.specs2.matcher.MustMatchers
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.execute.BatchColumn
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

class AthenaQueryExecutorTest extends SpecWithJUnit with MustMatchers with Mockito {

  class ctx extends Scope {
    val athena = mock[AthenaClient]
    val executor = new AthenaQueryExecutor(athena)
    val query = ImmutableSubQuery(id = "query-id", text = "select 1", user = User("athena-test"))
    val builder = spy(new SingleBuilder)
  }

  "AthenaQueryExecutor" should {
    "notify builder on exceptions in client.init" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      athena.init(query) returns Task.raiseError(exception)

      // call
      executor.initClient(query, builder).runToFuture

      // verify
      eventually {
        there was one(builder).error(query.id, exception)
      }
    }

    "notify builder on exceptions in client.advance" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      athena.advance(any(), any()) returns Task.raiseError(exception)

      // call
      executor.advance(builder, query.id, query).runToFuture


      // verify
      eventually {
        there was one(builder).errorSubQuery(query.id, exception)
      }
    }


  }

  "AthenaQueryExecutor.waitLoop" should {
    "stop if query is canceled but still running" in new ctx {
      // query that is still running
      athena.get(anyString) returns Task.now(
        new GetQueryExecutionResult()
          .withQueryExecution(new QueryExecution()
            .withStatus(new QueryExecutionStatus()
              .withState(QueryExecutionState.RUNNING))))

      // call
      val queryExecution = executor.waitLoop("query-id", query.copy(canceled = Atomic(true)), builder).runSyncUnsafe()

      // verify
      queryExecution must_=== QueryExecutionState.RUNNING
    }

    "stop if query is canceled but still queued" in new ctx {
      // query that is still running
      athena.get(anyString) returns Task.now(
        new GetQueryExecutionResult()
          .withQueryExecution(new QueryExecution()
            .withStatus(new QueryExecutionStatus()
              .withState(QueryExecutionState.QUEUED))))

      // call
      val queryExecution = executor.waitLoop("query-id", query.copy(canceled = Atomic(true)), builder).runSyncUnsafe()

      // verify
      queryExecution must_=== QueryExecutionState.QUEUED
    }

    "stop if query is finished" in new ctx {
      // query that is still running
      val running = {
        Task.now(
          new GetQueryExecutionResult()
            .withQueryExecution(new QueryExecution()
              .withStatus(new QueryExecutionStatus()
                .withState(QueryExecutionState.RUNNING))))
      }

      val finished = {
        Task.now(
          new GetQueryExecutionResult()
            .withQueryExecution(new QueryExecution()
              .withStatus(new QueryExecutionStatus()
                .withState(QueryExecutionState.SUCCEEDED))))
      }

      athena.get(anyString) returns(running, finished)

      // call
      val queryExecution = executor.waitLoop("query-id", query, builder).runSyncUnsafe()

      // verify
      queryExecution must_=== QueryExecutionState.SUCCEEDED
    }

    "stop if query is FAILED and notify builder" in new ctx {
      // query that is still running
      val running = {
        Task.now(
          new GetQueryExecutionResult()
            .withQueryExecution(new QueryExecution()
              .withStatus(new QueryExecutionStatus()
                .withState(QueryExecutionState.RUNNING))))
      }

      val failed = {
        Task.now(
          new GetQueryExecutionResult()
            .withQueryExecution(new QueryExecution()
              .withStatus(new QueryExecutionStatus()
                .withState(QueryExecutionState.FAILED)
                .withStateChangeReason("boom!"))))
      }

      athena.get(anyString) returns(running, failed)

      // call
      val queryExecution = executor.waitLoop("query-id", query, builder).runSyncUnsafe()

      // verify
      queryExecution must_=== QueryExecutionState.FAILED
      builder.lastError.map(_.getMessage) must beSome("Query failed with status FAILED with reason = boom!")
    }
  }

  "AthenaQueryExecutor.makeBatch" should {

    "pass sanity" in new ctx {
      val emptyResult = new GetQueryResultsResult()
        .withResultSet(new ResultSet()
          .withRows()
          .withResultSetMetadata(new ResultSetMetadata().withColumnInfo()))

      val batch = executor.makeBatch(emptyResult)

      batch.columns must beEmpty
      batch.data must beEmpty
    }

    "skip first row for first batch" in new ctx {
      val firstResult = new GetQueryResultsResult()
        .withResultSet(new ResultSet()
          .withRows(new Row().withData(new Datum().withVarCharValue("foo")))
          .withResultSetMetadata(new ResultSetMetadata().withColumnInfo(new ColumnInfo().withName("foo"))))

      val batch = executor.makeBatch(firstResult, isFirst = true)

      batch.columns must beSome(List(BatchColumn("foo")))
      batch.data must beEmpty
    }

    "convert data and skip columns on non first batches" in new ctx {
      val result = new GetQueryResultsResult()
        .withResultSet(new ResultSet()
          .withRows(new Row().withData(new Datum().withVarCharValue("123")))
          .withResultSetMetadata(new ResultSetMetadata().withColumnInfo(new ColumnInfo().withName("foo").withType("bigint"))))

      val batch = executor.makeBatch(result)

      batch.columns must beEmpty
      batch.data must_=== List(List(123))
    }
  }

}
