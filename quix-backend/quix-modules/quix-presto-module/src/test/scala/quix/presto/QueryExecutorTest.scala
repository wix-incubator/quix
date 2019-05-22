package quix.presto


import java.util.UUID

import monix.eval.Task
import monix.execution.Scheduler
import org.specs2.matcher.MustMatchers
import org.specs2.mock.Mockito
import org.specs2.mutable.SpecWithJUnit
import org.specs2.specification.Scope
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.core.results.SingleBuilder
import quix.core.utils.JsonOps.Implicits.global
import quix.core.utils.StringJsonHelpersSupport
import quix.presto.rest.{PrestoQueryInfo, PrestoState, PrestoStateClient, PrestoStateToResults}

import scala.concurrent.duration._

class QueryExecutorTest extends SpecWithJUnit with MustMatchers with Mockito with StringJsonHelpersSupport {

  class ctx extends Scope {
    val client = mock[PrestoStateClient]
    val builder = spy(new SingleBuilder[String])
    val queryId = UUID.randomUUID().toString
    val query = ActiveQuery(queryId, Seq("select 1"), User("user@quix"))
    val stateWithoutNext = {
      s"""{"id":"presto-id","infoUri":"info-uri","stats":{"state":"PLANNING","scheduled":false,"totalSplits":0,"queuedSplits":0,"runningSplits":0,"completedSplits":456}}"""
    }.as[PrestoState]

    val stateWithNextUri = {
      """{"id":"presto-id","infoUri":"info-uri","nextUri":"next-uri","stats":{"state":"RUNNING","scheduled":false,"totalSplits":0,"queuedSplits":0,"runningSplits":0,"completedSplits":123}}"""
    }.as[PrestoState]

    val stateWithDataRows = {
      """{"id":"20150720_141132_01041_k74p7","infoUri":"http://presto:8181/v1/query/20150720_141132_01041_k74p7","partialCancelUri":"http://172.16.210.140:8181/v1/stage/20150720_141132_01041_k74p7.0","nextUri":"http://presto:8181/v1/statement/20150720_141132_01041_k74p7/2","columns":[{"name":"Catalog","type":"varchar","typeSignature":{"rawType":"varchar","typeArguments":[],"literalArguments":[]}}],"data":[["raptor"],["system"],["jmx"],["apollo"],["events"],["sunduk"]],"stats":{"state":"RUNNING","scheduled":true,"nodes":1,"totalSplits":1,"queuedSplits":0,"runningSplits":0,"completedSplits":1,"userTimeMillis":0,"cpuTimeMillis":0,"wallTimeMillis":1,"processedRows":0,"processedBytes":0,"rootStage":{"stageId":"0","state":"RUNNING","done":false,"nodes":1,"totalSplits":1,"queuedSplits":0,"runningSplits":0,"completedSplits":1,"userTimeMillis":0,"cpuTimeMillis":0,"wallTimeMillis":1,"processedRows":6,"processedBytes":67,"subStages":[]}}}"""
    }.as[PrestoState]

    val prestoQueryInfoWithCatalogAndSetSession = {
      """{"queryId":"presto-id", "state":"FINISHED", "setSessionProperties" : {"some.session.key": "true"}, "resetSessionProperties" : ["first.session.key"], "setCatalog":"some-catalog", "setSchema":"some-schema", "queryStats" : {"outputDataSize":"0B","processedInputDataSize":"0B", "processedInputPositions":0, "queuedTime":"91.14us", "totalPlanningTime":"304.00ns", "outputPositions":0}}""".stripMargin
    }.as[PrestoQueryInfo]

    val scheduler = Scheduler.global
    val testDelay = 0.seconds
    val executor = new QueryExecutor(client, testDelay)

  }

  "QueryExecutor" should {

    "notify builder on exceptions in client.init" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      client.init(query) returns Task.raiseError(exception)

      // call
      executor.initClient(query, builder).runToFuture(scheduler)

      // verify
      eventually {
        there was one(builder).error(queryId, exception)
      }
    }

    "notify builder on exceptions in client.advance" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      client.advance(anyString) returns Task.raiseError(exception)

      // call
      executor.advance("some-uri", builder, query.id, query).runToFuture(scheduler)


      // verify
      eventually {
        there was one(builder).errorSubQuery(query.id, exception)
      }
    }

    "notify builder on success of client.init" in new ctx {
      // mock
      client.init(query) returns Task.now(stateWithoutNext)

      // call
      executor.runTask(query, builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(builder).startSubQuery(stateWithoutNext.id, query.text, PrestoStateToResults(stateWithoutNext))
        there was one(builder).endSubQuery(stateWithoutNext.id)
      }
    }

    "notify builder on success of client.init / client.advance" in new ctx {
      // mock
      client.init(query) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithoutNext)

      // call
      executor.runTask(query, builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(builder).startSubQuery(stateWithoutNext.id, query.text, PrestoStateToResults(stateWithNextUri))

        there was one(builder).addSubQuery(stateWithNextUri.id, PrestoStateToResults(stateWithoutNext))

        there was one(builder).endSubQuery(stateWithoutNext.id)
      }
    }

    "notify builder on success of client.init / multiple client.advances" in new ctx {
      // mock
      client.init(query) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithNextUri) thenReturns Task.now(stateWithoutNext)

      // call
      executor.runTask(query, builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(builder).startSubQuery(stateWithoutNext.id, query.text, PrestoStateToResults(stateWithNextUri))

        there was one(builder).addSubQuery(stateWithNextUri.id, PrestoStateToResults(stateWithoutNext))

        there was one(builder).endSubQuery(stateWithoutNext.id)
      }
    }

    "cancel execution if query.isCanceled == true" in new ctx {
      // mock
      client.init(any()) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithNextUri) thenReturns Task.now(stateWithoutNext)

      // call
      executor.runTask(query.copy(isCancelled = true), builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(builder).startSubQuery(stateWithoutNext.id, query.text, PrestoStateToResults(stateWithNextUri))

        there was no(builder).addSubQuery(stateWithNextUri.id, PrestoStateToResults(stateWithoutNext))

        there was one(builder).endSubQuery(stateWithoutNext.id)
      }
    }

    "close presto client if query.isCanceled == true" in new ctx {
      // mock
      client.init(any()) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithNextUri)

      // call
      executor.runTask(query.copy(isCancelled = true), builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(client).close(stateWithNextUri)
      }
    }

    "close presto client in case of exceptions during client.advance" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      client.init(any()) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.raiseError(exception)

      // call
      executor.runTask(query, builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(client).close(stateWithNextUri)
      }
    }

    "close presto client in case of exceptions during builder.startSubQuery" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      client.init(any()) returns Task.now(stateWithNextUri)
      builder.startSubQuery(any(), any(), any()) throws exception

      // call
      executor.runTask(query, builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(client).close(stateWithNextUri)
      }
    }

    "close presto client in case of exceptions during builder.addSubQuery" in new ctx {
      // mock
      val exception = new RuntimeException("boom!")
      client.init(any()) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithNextUri) thenReturns Task.now(stateWithoutNext)
      builder.addSubQuery(any(), any()) throws exception

      // call
      executor.runTask(query, builder).runToFuture(scheduler)


      // verify
      eventually {
        there was one(client).close(stateWithNextUri)
      }
    }

    "increase delay if last state didn't had any rows" in new ctx {
      val delay = 10.seconds
      executor.nextDelay(delay, stateWithNextUri) must_=== 20.seconds
    }

    "delay should not exceed max delay" in new ctx {
      val delay = 1000.seconds
      executor.nextDelay(delay, stateWithNextUri) must_=== executor.maxAdvanceDelay
    }

    "delay should be reset in case of rows in result" in new ctx {
      val delay = 10.seconds
      executor.nextDelay(delay, stateWithDataRows) must_=== executor.initialAdvanceDelay
    }

    "update active query with catalog/schema if query info has setCatalog / setSchema commands" in new ctx {
      // mock
      client.init(query) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithoutNext)
      client.info(any()) returns Task.now(prestoQueryInfoWithCatalogAndSetSession)
      client.close(any()) returns Task.unit

      // call
      executor.runTask(query, builder).runToFuture(scheduler)

      eventually {
        query.catalog must beSome("some-catalog")
        query.schema must beSome("some-schema")
      }
    }

    "update active query with session params if query info has setSessionProperties" in new ctx {
      // mock
      client.init(query) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithoutNext)
      client.info(any()) returns Task.now(prestoQueryInfoWithCatalogAndSetSession)
      client.close(any()) returns Task.unit

      // call
      executor.runTask(query, builder).runToFuture(scheduler)

      eventually {
        query.session must havePair("some.session.key", "true")
      }
    }

    "unset session properties of active if query info has resetSessionProperties" in new ctx {
      // mock
      val queryWithSession = query.copy(session = Map("first.session.key" -> "false", "second.session.key" -> "true"))
      client.init(queryWithSession) returns Task.now(stateWithNextUri)
      client.advance(anyString) returns Task.now(stateWithoutNext)
      client.info(any()) returns Task.now(prestoQueryInfoWithCatalogAndSetSession)
      client.close(any()) returns Task.unit

      // call
      executor.runTask(queryWithSession, builder).runToFuture(scheduler)

      eventually {
        // existed before execution
        queryWithSession.session must havePair("second.session.key", "true")

        // was added during execution
        queryWithSession.session must havePair("some.session.key", "true")

        // was removed during execution
        queryWithSession.session must not haveKey "first.session.key"
      }
    }
  }
}

