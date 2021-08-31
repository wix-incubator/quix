package quix.core.executions

import monix.execution.Scheduler.Implicits.global
import org.specs2.matcher.MustMatchers
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.execute._
import quix.api.v1.users.User
import quix.core.results.MultiBuilder
import quix.core.utils.{TestConsumer, TestExecutor}

class SqlModuleTest extends SpecWithJUnit with MustMatchers {

  class ctx extends Scope {
    val consumer = new TestConsumer[ExecutionEvent]
    val builder = new MultiBuilder(consumer)
    val user = User("user@quix", "user-id")
    val executor = new TestExecutor
    val module = new SqlModule(executor, None)

    val emptyCommand = StartCommand[String]("select 1", Map.empty)

    def loop(command: StartCommand[String]): StartCommand[String] =
      command.copy(session =
        Map(
          "loop.startTime" -> "2020-01-01T01:00:00Z",
          "loop.stopTime" -> "2020-01-07T01:00:00Z",
          "loop.interval" -> "P1D",
          "loop" -> "true"
        ))
  }

  "SqlModule.start" should {
    "invoke builder.start & builder.end methods on every command" in new ctx {
      module.start(emptyCommand, "id", user, builder).runSyncUnsafe()

      consumer.payloads must contain(Start("id", 1))
      consumer.payloads must contain(End("id"))
    }

    "support run looper" in new ctx {
      val command = loop(StartCommand[String]("select '$START_TIME' as start, '$STOP_TIME' as stop", Map.empty))

      module.start(command, "id", user, builder).runSyncUnsafe()

      consumer.payloads must contain(Log("id", """Started iteration 1 out of 6 with params ["$START_TIME" : "2020-01-01 01:00:00","$STOP_TIME" : "2020-01-02 01:00:00"]""", "INFO"))
      consumer.payloads must contain(Log("id", """Finished iteration 1 out of 6 with params ["$START_TIME" : "2020-01-01 01:00:00","$STOP_TIME" : "2020-01-02 01:00:00"]""", "INFO"))

      consumer.payloads must contain(Log("id", """Started iteration 6 out of 6 with params ["$START_TIME" : "2020-01-06 01:00:00","$STOP_TIME" : "2020-01-07 01:00:00"]""", "INFO"))
      consumer.payloads must contain(Log("id", """Finished iteration 6 out of 6 with params ["$START_TIME" : "2020-01-06 01:00:00","$STOP_TIME" : "2020-01-07 01:00:00"]""", "INFO"))

      executor.queries must_=== List(
        "select '2020-01-01 01:00:00' as start, '2020-01-02 01:00:00' as stop",
        "select '2020-01-02 01:00:00' as start, '2020-01-03 01:00:00' as stop",
        "select '2020-01-03 01:00:00' as start, '2020-01-04 01:00:00' as stop",
        "select '2020-01-04 01:00:00' as start, '2020-01-05 01:00:00' as stop",
        "select '2020-01-05 01:00:00' as start, '2020-01-06 01:00:00' as stop",
        "select '2020-01-06 01:00:00' as start, '2020-01-07 01:00:00' as stop",
      )
    }
  }
}
