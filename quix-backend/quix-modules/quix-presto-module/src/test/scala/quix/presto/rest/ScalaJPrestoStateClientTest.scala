package quix.presto.rest


import java.util.UUID

import monix.eval.Task
import monix.execution.Scheduler
import org.specs2.matcher.{MustMatchers, Scope}
import org.specs2.mutable.SpecWithJUnit
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.presto.PrestoConfig
import scalaj.http.HttpResponse

import scala.concurrent.Await
import scala.concurrent.duration._

class ScalaJPrestoStateClientTest extends SpecWithJUnit with MustMatchers with StringJsonHelpersSupport {

  class ctx extends Scope {
    val config = PrestoConfig("statements", "health", "queryInfo", "default-schema", "default-catalog", "default-source")
    val client = new ScalaJPrestoStateClient(config)
    val queryId = UUID.randomUUID().toString
    val query = ActiveQuery(queryId, Seq("select 1"), User("user@quix"))
    val advanceUri = "localhost/1"

    val stateJson = s"""{"id":"presto-id","infoUri":"info-uri","nextUri":"next-uri","stats":{"state":"RUNNING","scheduled":false,"totalSplits":0,"queuedSplits":0,"runningSplits":0,"completedSplits":123}}"""

    val state = stateJson.as[PrestoState]

    def asValue[T](task: Task[T]): T = {
      val future = task.runToFuture(Scheduler.global)
      Await.result(future, Duration.Inf)
    }
  }

  "ScalaJPrestoStateClient" should {
    "pass sanity" in new ctx {
      client.init(query) must beAnInstanceOf[Task[PrestoState]]
      client.advance(advanceUri) must beAnInstanceOf[Task[PrestoState]]
      client.close(state) must beAnInstanceOf[Task[PrestoState]]
    }

    "handle 200 responses and convert them into valid presto state objects" in new ctx {
      val goodResponse = HttpResponse(stateJson, 200, Map("Status" -> IndexedSeq("bla")))

      asValue(client.readPrestoState[PrestoState](goodResponse)) must_=== state
    }

    "handle not 200 responses and fail them" in new ctx {
      val response = HttpResponse[String]("bad response", 500, Map.empty)

      asValue(client.readPrestoState[PrestoState](response)) must throwAn[IllegalArgumentException]
    }
  }

}