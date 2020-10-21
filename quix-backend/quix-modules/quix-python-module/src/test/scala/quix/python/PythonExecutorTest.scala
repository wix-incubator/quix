package quix.python

import java.util.UUID

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.Matcher
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

class PythonExecutorTest extends SpecWithJUnit {
  sequential

  class ctx extends Scope {
    val executor = new PythonExecutor
    lazy val user = User("user-" + UUID.randomUUID().getLeastSignificantBits + "@quix.com", "user-id")

    val builder = new SingleBuilder

    def have(item: String): Matcher[SingleBuilder] = {
      be_==(item) ^^ ((resultBuilder: SingleBuilder) =>
        resultBuilder.build().map(_.toString()).mkString)
    }

    def script(code: String, modules: List[String] = Nil) =
      ImmutableSubQuery(code, user, id = "query-id")
  }

  "pass sanity" in new ctx {
    executor.execute(script(
      """import sys
        |
        |sys.exit()
        |""".stripMargin), builder).runSyncUnsafe()

    builder.build() must beEmpty
  }

  "pass stdout to logs" in new ctx {
    executor.execute(script("""print('hello from python')"""), builder).runSyncUnsafe()

    builder.logs must contain("hello from python")
  }

  "pass stderr to logs" in new ctx {
    executor.execute(script("""import foo"""), builder).runSyncUnsafe()

    builder.logs.mkString("\n") must contain("ModuleNotFoundError: No module named 'foo'")
  }

  "support q.fields and q.row methods" in new ctx {
    executor.execute(script(
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
    executor.execute(script(
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
    executor.execute(script(
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
