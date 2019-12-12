package quix.python

import java.util.UUID

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
    val executions = new SequentialExecutions[String](executor)
    lazy val user = User("user-" + UUID.randomUUID().getLeastSignificantBits + "@quix.com", "user-id")

    val builder = new SingleBuilder[String]

    def have(item: String): Matcher[SingleBuilder[String]] = {
      be_==(item) ^^ ((resultBuilder: SingleBuilder[String]) =>
        resultBuilder.build().map(_.toString()).mkString)
    }

    def script(code: String, modules: List[String] = Nil): ActiveQuery[String] =
      ActiveQuery("query-id", Seq(code), user, session = Map("modules" -> modules))
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
        |q.fields('foo', 'boo')
        |q.row(1, 2)
        |""".stripMargin), builder).runSyncUnsafe()

    builder.columns.map(_.name) must_=== List("foo", "boo")
    builder.build().head.map(_.toString.toInt) must_=== List(1, 2)
  }

  "support installing specific versions of modules" in new ctx {
    executor.runTask(script(
      // https://github.com/psf/requests/releases/tag/v2.18.1 from June 2017
      modules = List("requests==2.18.1"),
      code =
        """from quix import Quix
          |q = Quix()
          |
          |q.fields('foo', 'boo')
          |q.row(1, 2)
          |""".stripMargin), builder).runSyncUnsafe()

    builder.columns.map(_.name) must_=== List("foo", "boo")
    builder.build().head.map(_.toString.toInt) must_=== List(1, 2)
  }

  "use packages for installing new packages " in new ctx {
    executor.runTask(script(
      code =
        """packages.install('pipdate')
          |packages.install('ujson')
          |
          |import pipdate
          |import ujson
          |
          |from quix import Quix
          |q = Quix()
          |
          |q.fields('foo', 'boo')
          |q.row(1, 2)
          |""".stripMargin), builder).runSyncUnsafe()

    builder.columns.map(_.name) must_=== List("foo", "boo")
    builder.build().head.map(_.toString.toInt) must_=== List(1, 2)
  }

  "support requirements syntax for packages.install " in new ctx {
    executor.runTask(script(
      code =
        """packages.install('ujson==1.35')
          |packages.install('ujson>1.0')
          |packages.install('ujson>1.0,<1.30')
          |
          |import ujson
          |print(123)
          |""".stripMargin), builder).runSyncUnsafe()

    builder.logs must contain("123")
  }
}
