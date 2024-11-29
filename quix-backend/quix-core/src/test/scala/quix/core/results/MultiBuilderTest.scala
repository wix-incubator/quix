package quix.core.results

import monix.execution.Scheduler
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.v1.execute.Batch._
import quix.api.v1.execute._
import quix.api.v1.users.User
import quix.api.v2.execute.{ImmutableSubQuery, Query}
import quix.core.utils.TestConsumer

class MultiBuilderTest extends SpecWithJUnit {

  class ctx extends Scope {
    val consumer = new TestConsumer[ExecutionEvent]
    val builder = new MultiBuilder(consumer)
    val query = ImmutableSubQuery("text", User("test"))
    val execution = Query(List(query), canceled = query.canceled)
  }

  "MultiBuilder.start" should {
    "send Start event on start(query)" in new ctx {
      builder.start(execution).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Start(execution.id, execution.subQueries.size))
      }
    }
  }

  "MultiBuilder.end" should {

    "send End event on end(query)" in new ctx {
      builder.end(execution).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(End(execution.id))
      }
    }
  }

  "MultiBuilder.startSubQuery" should {

    "send StartQuery & SubQueryDetails event on every startSubQuery(queryId, code, results)" in new ctx {
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(SubQueryStart("query-id"))
        consumer.payloads must contain(SubQueryDetails("query-id", "code"))
      }
    }

    "send SubQueryFields if columns are present in results during startSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List.empty, Option(List(BatchColumn("column"))))
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(SubQueryFields("query-id", List("column")))
      }
    }

    "send SubQueryFields only once if columns are present in results during startSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List.empty, Option(List(BatchColumn("column"))))
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads.filter(_ == SubQueryFields("query-id", List("column"))) must haveSize(1)
      }
    }

    "send Progress if present in results during startSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List.empty).withPercentage(100)
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Progress("query-id", 100))
      }
    }

    "send Progress on every batch during startSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List.empty).withPercentage(100)
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads.filter(_ == Progress("query-id", 100)) must haveSize(2)
      }
    }

    "send Error if present in results during startSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List.empty, error = Option(BatchError("boom!")))
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Error("query-id", "boom!"))
      }
    }

    "send Row events if data is present in results during startSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List(List("a", "b", "c"), List("d", "e", "f")))
      builder.startSubQuery("query-id", "code").runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Row("query-id", List("a", "b", "c")))
        consumer.payloads must contain(Row("query-id", List("d", "e", "f")))
      }
    }
  }

  "MultiBuilder.endSubQuery" should {

    "send SubQueryEnd event on endSubQuery(query)" in new ctx {
      builder.endSubQuery(query.id).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(SubQueryEnd(query.id))
      }
    }
  }

  "MultiBuilder.errorSubQuery" should {

    "send SubQueryError event on errorSubQuery(query)" in new ctx {
      builder.errorSubQuery(query.id, new Exception("boom!")).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(SubQueryError(query.id, "Exception(boom!)"))
      }
    }

    "omit exception class on ExceptionPropagatedToClient" in new ctx {
      builder.errorSubQuery(query.id, ExceptionPropagatedToClient("boom!")).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(SubQueryError(query.id, "boom!"))
      }
    }
  }

  "MultiBuilder.error" should {

    "send Error event on error(query)" in new ctx {
      builder.error(query.id, new Exception("boom!")).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Error(query.id, "Exception(boom!)"))
      }
    }

    "omit exception class on ExceptionPropagatedToClient" in new ctx {
      builder.error(query.id, ExceptionPropagatedToClient("boom!")).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Error(query.id, "boom!"))
      }
    }
  }

  "MultiBuilder.addSubQuery" should {

    "send SubQueryFields if columns are present in results during addSubQuery(queryId, results)" in new ctx {
      val batch = Batch(List.empty, Option(List(BatchColumn("column"))))
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(SubQueryFields("query-id", List("column")))
      }
    }

    "send SubQueryFields only once if columns are present in results during addSubQuery(queryId, results)" in new ctx {
      val batch = Batch(List.empty, Option(List(BatchColumn("column"))))
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads.filter(_ == SubQueryFields("query-id", List("column"))) must haveSize(1)
      }
    }

    "send Progress if present in results during addSubQuery(queryId, results)" in new ctx {
      val batch = Batch(List.empty).withPercentage(100)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Progress("query-id", 100))
      }
    }

    "send Progress on every batch during addSubQuery(queryId, results)" in new ctx {
      val batch = Batch(List.empty).withPercentage(100)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads.filter(_ == Progress("query-id", 100)) must haveSize(2)
      }
    }

    "send Error if present in results during addSubQuery(queryId, results)" in new ctx {
      val batch = Batch(List.empty, error = Option(BatchError("boom!")))
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Error("query-id", "boom!"))
      }
    }

    "send Row events if data is present in results during addSubQuery(queryId, code, results)" in new ctx {
      val batch = Batch(List(List("a", "b", "c"), List("d", "e", "f")))
      builder.addSubQuery("query-id", batch).runToFuture(Scheduler.global)

      eventually {
        consumer.payloads must contain(Row("query-id", List("a", "b", "c")))
        consumer.payloads must contain(Row("query-id", List("d", "e", "f")))
      }
    }
  }

}