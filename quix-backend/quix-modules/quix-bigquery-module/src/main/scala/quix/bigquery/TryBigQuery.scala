package quix.bigquery

import java.nio.file.{Files, Paths}

import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler.Implicits.global
import quix.api.users.User
import quix.core.executions.SequentialExecutions
import quix.core.results.SingleBuilder

object TryBigQuery extends LazyLogging {
  val credentials = Files.readAllBytes(Paths.get("credentials.json"))
  val config = BigQueryConfig(credentials, 1000 * 60, 1000 * 10)

  def main(args: Array[String]): Unit = {
    val client = BigQueryQueryExecutor(config)

    val text = "SELECT * FROM `bigquery-public-data.samples.github_nested` LIMIT 20000"

    val builder = new SingleBuilder[String]

    val executions = new SequentialExecutions[String](client)

    val task = executions.execute(Seq.fill(2)(text), User("valeryf@wix.com", "valeryf"), builder)

    task.runSyncUnsafe()

    logger.info(s"rows=${builder.build().size}")
  }
}
