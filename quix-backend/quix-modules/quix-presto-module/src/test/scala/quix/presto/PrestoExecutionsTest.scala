package quix.presto


import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.Matcher
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.users.User
import quix.core.results.SingleBuilder
import quix.presto.rest.PrestoSql

class PrestoExecutionsTest extends SpecWithJUnit with Mockito {

  class ctx extends Scope {
    val executor = new TestQueryExecutor
    val executions = new PrestoExecutions(executor)
    val user = User("test")
    val builder = spy(new SingleBuilder)
    val builderSpy = spy(builder)

    val zeroQueries: Seq[PrestoSql] = Seq.empty
    val oneQuery: Seq[PrestoSql] = Seq(PrestoSqlWithSession("select 1"))
    val twoQueries: Seq[PrestoSql] = Seq(PrestoSqlWithSession("select 1"), PrestoSqlWithSession("select 2"))

    def have(item: String): Matcher[SingleBuilder] = {
      be_==(item) ^^ ((resultBuilder: SingleBuilder) => resultBuilder.build().map(_.mkString(",")).mkString)
    }

    def haveZeroResults: Matcher[SingleBuilder] = {
      be_==(0) ^^ ((builder: SingleBuilder) => builder.build().size)
    }
  }

  "PrestoExecutions" should {

    "call builder.start & builder.end on every query" in new ctx {
      executions.execute(zeroQueries, user, builder).runToFuture

      there was one(builder).start(any())
      there was one(builder).end(any())
    }

    "not call builder.startSub or builder.endSub on zero queries" in new ctx {
      executions.execute(zeroQueries, user, builderSpy).runToFuture

      builder must haveZeroResults

      there was no(builderSpy).startSubQuery(any(), any(), any())
      there was no(builderSpy).addSubQuery(any(), any())
      there was no(builderSpy).endSubQuery(any())
    }

    "call builder.start/end on query that returned results" in new ctx {
      executor.withResults(List(List("1")))

      executions.execute(oneQuery, user, builder).runToFuture

      eventually {
        builder must have("1")
      }
    }
  }

}
