package quix.web.controllers

import com.typesafe.scalalogging.LazyLogging
import quix.web.{E2EContext, MockBeans}

class SqlStreamingControllerTest extends E2EContext with LazyLogging {
  sequential

  val executor = MockBeans.queryExecutor

  override def before(): Unit = executor.clear

  "SqlStreamingController" should {
    "pass sanity" in {
      executor.withResults(List(List("1")), columns = List("_col0"))
      val listener = execute("select 1", module = "presto-prod")

      listener.messages must contain("""{"event":"query-start","data":{"id":"query-id"}}""")
      listener.messages must contain("""{"event":"query-details","data":{"id":"query-id","code":"select 1"}}""")
      listener.messages must contain("""{"event":"percentage","data":{"id":"query-id","percentage":0}}""")
      listener.messages must contain("""{"event":"fields","data":{"id":"query-id","fields":["_col0"]}}""")
      listener.messages must contain("""{"event":"row","data":{"id":"query-id","values":["1"]}}""")
      listener.messages must contain("""{"event":"percentage","data":{"id":"query-id","percentage":100}}""")
      listener.messages must contain("""{"event":"query-end","data":{"id":"query-id","statistics":{}}}""")
    }

    "handleUnknownMessage" in {
      executor.withResults(List(List("1")), columns = List("_col0"))
      val listener = send("ping", "presto-prod")

      listener.messages must contain(contain("Failed to handle unknown message : [ping]"))
    }

    "handlePingEvent" in {
      executor.withResults(List(List("1")), columns = List("_col0"))
      val listener = send("""{"event":"ping"}""", "presto-prod")

      listener.messages must containEvent("""{"event":"pong","data":{}}""")
    }

    "handleMultipleStatements" in {
      executor
        .withResults(List(List("1")), queryId = "query-1", columns = List("foo"))
        .withResults(List(List("2")), queryId = "query-2", columns = List("boo"))

      val listener = execute("select 1 as foo;\nselect 2 as boo", module = "presto-prod")

      // first query
      {
        listener.messages must containEvent("""{"event":"query-start","data":{"id":"query-1"}}""")
        listener.messages must containEvent("""{"event":"query-details","data":{"id":"query-1","code":"select 1 as foo"}}""")
        listener.messages must containEvent("""{"event":"fields","data":{"id":"query-1","fields":["foo"]}}""")
        listener.messages must containEvent("""{"event":"percentage","data":{"id":"query-1","percentage":0}}""")
        listener.messages must containEvent("""{"event":"row","data":{"id":"query-1","values":["1"]}}""")
        listener.messages must containEvent("""{"event":"percentage","data":{"id":"query-1","percentage":100}}""")
        listener.messages must containEvent("""{"event":"query-end","data":{"id":"query-1","statistics":{}}}""")
      }

      // second query
      {
        listener.messages must containEvent("""{"event":"query-start","data":{"id":"query-2"}}""")
        listener.messages must containEvent("""{"event":"query-details","data":{"id":"query-2","code":"select 2 as boo"}}""")
        listener.messages must containEvent("""{"event":"fields","data":{"id":"query-2","fields":["boo"]}}""")
        listener.messages must containEvent("""{"event":"percentage","data":{"id":"query-2","percentage":0}}""")
        listener.messages must containEvent("""{"event":"row","data":{"id":"query-2","values":["2"]}}""")
        listener.messages must containEvent("""{"event":"percentage","data":{"id":"query-2","percentage":100}}""")
        listener.messages must containEvent("""{"event":"query-end","data":{"id":"query-2","statistics":{}}}""")
      }

    }

  }

}
