package quix.bigquery

import java.nio.file.{Files, Paths}

import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler.Implicits.global
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

object TryBigQuery extends LazyLogging {
  val credentials = Files.readAllBytes(Paths.get("credentials.json"))
  val config = BigQueryConfig(credentials, 1000 * 60, 1000 * 10)

  def main(args: Array[String]): Unit = {
    val client = BigQueryQueryExecutor(config)

    val text = "SELECT * FROM `bigquery-public-data.samples.github_nested` LIMIT 20000"

    val builder = new SingleBuilder

    val query = ImmutableSubQuery(text, User("valeryf@wix.com", "valeryf"))

    client.execute(query, builder).runSyncUnsafe()

    logger.info(s"rows=${builder.build().size}")
  }
}
