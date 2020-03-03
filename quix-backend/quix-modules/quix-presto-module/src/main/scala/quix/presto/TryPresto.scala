package quix.presto

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder
import quix.presto.rest.ScalaJPrestoStateClient

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
      builder = new SingleBuilder
    } yield executor.execute(query, builder).map(_ => builder)

    val builders = Task.sequence(results).runSyncUnsafe()

    for {
      (builder, index) <- builders.zipWithIndex
    } logger.info(s"builder $index got ${builder.build().length} rows")
  }

  def activeQuery(text: String) = {
    ImmutableSubQuery(text, User(id = "user", email = "user@quix"))
  }
}
