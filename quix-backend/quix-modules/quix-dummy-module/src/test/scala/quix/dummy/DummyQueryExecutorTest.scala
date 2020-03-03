package quix.dummy

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

class DummyQueryExecutorTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new DummyQueryExecutor

    def makeQuery(text: String) = {
      ImmutableSubQuery(text, User("dummy-test-user"), id = "query-id")
    }

    val query = makeQuery("select 1")
    val builder = new SingleBuilder
  }

  "DummyQueryExecutor" should {
    "pass sanity" in new ctx {
      executor.execute(
        query, builder).runSyncUnsafe()

      builder.build() must not be empty
    }
  }

}
