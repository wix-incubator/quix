package quix.python

import monix.execution.Scheduler.Implicits.traced
import org.specs2.matcher.Matcher
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.core.executions.SequentialExecutions
import quix.core.results.SingleBuilder

class PythonExecutorTest extends SpecWithJUnit {
  sequential

  class ctx extends Scope {
    val executor = new PythonExecutor
    val executions = new SequentialExecutions[PythonCode](executor)
    val user = User("user-email", "user-id")

    val builder = new SingleBuilder[PythonCode]

    def have(item: String): Matcher[SingleBuilder[String]] = {
      be_==(item) ^^ ((resultBuilder: SingleBuilder[String]) =>
        resultBuilder.build().map(_.toString()).mkString)
    }

    def script(code: String): ActiveQuery[PythonCode] = ActiveQuery("query-id", Seq(PythonCode(code)), user)
  }

  "pass sanity" in new ctx {
    executor.runTask(script(
      """import sys
        |
        |sys.exit()
        |""".stripMargin), builder).runSyncUnsafe()

    builder.build() must beEmpty
  }

  "pass stdout to logs" in new ctx {
    executor.runTask(script("""print('hello from python')"""), builder).runSyncUnsafe()

    builder.logs must contain("hello from python")
  }

  "pass stderr to logs" in new ctx {
    executor.runTask(script("""import foo"""), builder).runSyncUnsafe()

    builder.logs.mkString("\n") must contain("ModuleNotFoundError: No module named 'foo'")
  }

  "support q.fields and q.row methods" in new ctx {
    executor.runTask(script(
      """from quix import Quix
        |q = Quix()
        |
        |q.fields(['foo', 'boo'])
        |q.row([1, 2])
        |""".stripMargin), builder).runSyncUnsafe()

    builder.columns.map(_.name) must_=== List("foo", "boo")
    builder.build().head.map(_.toString.toInt) must_=== List(1, 2)
  }
}
