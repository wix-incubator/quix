package quix.presto


import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.Matcher
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.users.User
import quix.core.executions.SequentialExecutions
import quix.core.results.SingleBuilder

class PrestoExecutionsTest extends SpecWithJUnit with Mockito {

  class ctx extends Scope {
    val executor = new TestQueryExecutor
    val executions = new SequentialExecutions[String](executor)
    val user = User("test")
    val builder = spy(new SingleBuilder[String])
    val builderSpy = spy(builder)

    val zeroQueries: Seq[String] = Seq.empty
    val oneQuery: Seq[String] = Seq("select 1")
    val twoQueries: Seq[String] = Seq("select 1", "select 2")

    def have(item: String): Matcher[SingleBuilder[String]] = {
      be_==(item) ^^ ((resultBuilder: SingleBuilder[String]) => resultBuilder.build().map(_.mkString(",")).mkString)
    }

    def haveZeroResults: Matcher[SingleBuilder[String]] = {
      be_==(0) ^^ ((builder: SingleBuilder[String]) => builder.build().size)
    }
  }

  "PrestoExecutions" should {

    "call builder.start & builder.end on zero queries" in new ctx {
      executions.execute(zeroQueries, user, builder).runToFuture

      there was one(builder).start(any())
      there was one(builder).end(any())
    }

    "call builder.start & builder.end on every query" in new ctx {
      executions.execute(oneQuery, user, builder).runToFuture

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
