package quix.presto

import java.util.UUID

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.Scheduler
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.core.results.SingleBuilder
import quix.presto.rest.ScalaJPrestoStateClient

import scala.concurrent.Await
import scala.concurrent.duration.Duration

object TryPresto extends LazyLogging {

  def main(args: Array[String]): Unit = {
    val statementApi = "http://<.....enter your presto coordinator hostname.....>:8181/v1/statement/"
    val healthApi = "http://<.....enter your presto coordinator hostname.....>:8181/v1/cluster"
    val infoQueryApi = "http://<.....enter your presto coordinator hostname.....>:8181/v1/query/"
    val config = PrestoConfig(statementApi, healthApi, infoQueryApi, "events", "dbo", "quix")
    val client = new ScalaJPrestoStateClient(config)

    val executor = new QueryExecutor(client)

    val results = for {
      i <- 1 to 5
      query = activeQuery(s"-- query $i\n select 1")
      builder = new SingleBuilder[String]
    } yield executor.runTask(query, builder).map(_ => builder)

    val futureResults = Task.sequence(results).runToFuture(Scheduler.global)

    val builders = Await.result(futureResults, Duration.Inf)

    for {
      (builder, index) <- builders.zipWithIndex
    } logger.info(s"builder $index got ${builder.build().length} rows")
  }

  def activeQuery(text: String): ActiveQuery[String] = {
    val id = UUID.randomUUID().toString
    ActiveQuery(id, Seq(text), User(id = "user", email = "user@quix"))
  }
}
