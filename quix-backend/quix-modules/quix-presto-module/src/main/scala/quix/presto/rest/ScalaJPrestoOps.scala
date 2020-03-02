package quix.presto.rest

import quix.api.v2.execute.SubQuery
import quix.presto.PrestoConfig
import scalaj.http.{Http, HttpRequest}

object ScalaJPrestoOps {
  def makeHeaders(query: SubQuery, config: PrestoConfig): Map[String, String] = {
    val extraValues = for ((key, value) <- query.session)
      yield key + "=" + value

    Map(
      "x-presto-user" -> query.user.email,
      "x-presto-catalog" -> query.session.getOrElse("x-presto-catalog", config.catalog),
      "x-presto-schema" -> query.session.getOrElse("x-presto-schema", config.schema),
      "x-presto-source" -> config.source,
      "Content-Type" -> "text/plain",
      "Accept" -> "application/json",
      "x-presto-session" -> extraValues.mkString(", "))
  }

  def buildInitRequest(query: SubQuery, config: PrestoConfig): HttpRequest = {
    Http(config.statementsApi)
      .headers(makeHeaders(query, config))
      .postData(query.text.getBytes("UTF-8"))
  }
}
