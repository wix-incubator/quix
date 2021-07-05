package quix.web.controllers

import quix.web.{E2EContext, MockBeans}

class DownloadControllerTest extends E2EContext {
  sequential

  val executor = MockBeans.queryExecutor

  override def before = executor.clear

  "DownloadController" should {
    "pass sanity" in {
      val response = getResponse("/api/download/i-do-not-exist")

      response.code must_=== 404
    }

    "sendSingleQuery" in {
      executor.withResults(List(List("1")), columns = List("_col0"), queryId = "query-id-1")
      val listener = runAndDownload("select 1", "presto-prod")

      listener.await("""{"event":"query-download","data":{"id":"query-id-1","url":"/api/download/query-id-1"}}""")

      val response = getResponse("/api/download/query-id-1")

      response.body must_=== "\"_col0\"\n\"1\"\n"
    }

    "sendMultipleQueries" in {
      executor
        .withResults(List(List("1")), columns = List("foo"), queryId = "query-id-1")
        .withResults(List(List("2")), columns = List("bar"), queryId = "query-id-2")

      val listener = runAndDownload("select 1 as foo;\nselect 2 as bar;", "presto-dev")

      listener.await("""{"event":"query-download","data":{"id":"query-id-1","url":"/api/download/query-id-1"}}""")
      val first = getResponse("/api/download/query-id-1")

      listener.await("""{"event":"query-download","data":{"id":"query-id-2","url":"/api/download/query-id-2"}}""")
      val second = getResponse("/api/download/query-id-2")

      first.body must_=== "\"foo\"\n\"1\"\n"
      second.body must_=== "\"bar\"\n\"2\"\n"
    }

  }

}


