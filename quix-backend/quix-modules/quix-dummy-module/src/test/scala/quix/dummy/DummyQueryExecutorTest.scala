package quix.dummy

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.core.results.SingleBuilder

class DummyQueryExecutorTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val executor = new DummyQueryExecutor

    def makeQuery(text: String) = {
      ActiveQuery[String]("query-id", Seq(text), User("dummy-test-user"))
    }

    val query = makeQuery("select 1")
    val builder = new SingleBuilder[String]
  }

  "DummyQueryExecutor" should {
    "pass sanity" in new ctx {
      executor.runTask(query, builder).runSyncUnsafe()

      builder.build() must not be empty
    }
  }

}
