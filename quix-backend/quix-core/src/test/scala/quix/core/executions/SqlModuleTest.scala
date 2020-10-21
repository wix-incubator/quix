package quix.core.executions

import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.execute.{End, ExecutionEvent, Start, StartCommand}
import quix.api.v1.users.User
import quix.api.v2.execute.{Builder, Executor, SubQuery}
import quix.core.results.{MultiBuilder, TestConsumer}

class SqlModuleTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val consumer = new TestConsumer[ExecutionEvent]
    val builder = new MultiBuilder(consumer)
    val user = User("user@quix", "user-id")
    val module = new SqlModule(TestExecutor, None)

    val emptyCommand = StartCommand[String]("", Map.empty)
  }

  "SqlModule.start" should {
    "invoke builder.start & builder.end methods on every command" in new ctx {
      module.start(emptyCommand, "id", user, builder).runSyncUnsafe()

      eventually {
        consumer.payloads must contain(Start("id", 0))
        consumer.payloads must contain(End("id"))
      }
    }
  }

  object TestExecutor extends Executor {
    override def execute(query: SubQuery, builder: Builder): Task[Unit] = Task.unit
  }

}
