package quix.bigquery

import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

class BigQueryQueryExecutorTest extends SpecWithJUnit with MustMatchers with Mockito {

  class ctx extends Scope {

    val client = mock[BigQueryClient]
    val executor = new BigQueryQueryExecutor(client, 1000L)
    val query = ImmutableSubQuery(id = "query-id", text = "select 1", user = User("bigquery-test"))
    val builder = spy(new SingleBuilder)
  }

  "BigQueryQueryExecutor" should {
    "notify builder on exceptions in client.init" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      client.init(query) returns Task.raiseError(exception)

      // call
      executor.initClient(query, builder).runToFuture

      // verify
      eventually {
        there was one(builder).error(query.id, exception)
      }
    }
  }
}
