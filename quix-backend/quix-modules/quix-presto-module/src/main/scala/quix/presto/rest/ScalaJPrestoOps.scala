package quix.presto.rest

import java.net.URLEncoder

import quix.api.v2.execute.SubQuery
import quix.presto.PrestoConfig
import scalaj.http.{Http, HttpRequest}

object ScalaJPrestoOps {
  def makeHeaders(query: SubQuery, config: PrestoConfig): Map[String, String] = {
    val session = query.session.get

    val extraValues = for ((key, value) <- session if !key.startsWith("X-Presto"))
      yield key + "=" + URLEncoder.encode(value, "UTF-8")

    val prestoHeaders = session.filter { case (key, _) => key.startsWith("X-Presto") }

    Map(
      "X-Presto-User" -> query.user.email,
      "X-Presto-Catalog" -> config.catalog,
      "X-Presto-Schema" -> config.schema,
      "X-Presto-Source" -> config.source,
      "Content-Type" -> "text/plain",
      "Accept" -> "application/json",
      "X-Presto-Session" -> extraValues.mkString(", ")) ++ prestoHeaders
  }

  def buildInitRequest(query: SubQuery, config: PrestoConfig): HttpRequest = {
    Http(config.statementsApi)
      .headers(makeHeaders(query, config))
      .postData(query.text.getBytes("UTF-8"))
  }
}
