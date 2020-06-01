package quix.presto.rest


import java.util.UUID

import monix.eval.Task
import monix.execution.Scheduler
import monix.execution.Scheduler.Implicits.traced
import org.specs2.matcher.{MustMatchers, Scope}
import org.specs2.mutable.SpecWithJUnit
import quix.api.v1.execute.{ActiveQuery, ExceptionPropagatedToClient}
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.presto.PrestoConfig
import scalaj.http.HttpResponse

class ScalaJPrestoStateClientTest extends SpecWithJUnit with MustMatchers with StringJsonHelpersSupport {

  class ctx extends Scope {
    val config = PrestoConfig("statements", "health", "queryInfo", "default-schema", "default-catalog", "default-source")
    val client = new ScalaJPrestoStateClient(config)
    val query = ImmutableSubQuery("select 1", User("user@quix"))
    val advanceUri = "localhost/1"

    val stateJson = s"""{"id":"presto-id","infoUri":"info-uri","nextUri":"next-uri","stats":{"state":"RUNNING","scheduled":false,"totalSplits":0,"queuedSplits":0,"runningSplits":0,"completedSplits":123}}"""

    val state = stateJson.as[PrestoState]
  }

  "ScalaJPrestoStateClient" should {
    "pass sanity" in new ctx {
      client.init(query) must beAnInstanceOf[Task[PrestoState]]
      client.advance(advanceUri, query) must beAnInstanceOf[Task[PrestoState]]
      client.close(state, query) must beAnInstanceOf[Task[PrestoState]]
    }

    "handle 200 responses and convert them into valid presto state objects" in new ctx {
      val goodResponse = HttpResponse(stateJson, 200, Map("Status" -> IndexedSeq("bla")))

      client.readPrestoState[PrestoState](goodResponse)
        .runSyncUnsafe() must_=== state
    }

    "handle not 200 responses and fail them" in new ctx {
      val response = HttpResponse[String]("bad response", 500, Map.empty)

      client.readPrestoState[PrestoState](response)
        .runSyncUnsafe() must throwAn[ExceptionPropagatedToClient]
    }
  }

}