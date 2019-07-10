package quix.athena

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.athena.AmazonAthenaClient
import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler
import quix.api.execute.ActiveQuery
import quix.api.users.User
import quix.core.results.SingleBuilder

import scala.concurrent.Await
import scala.concurrent.duration.Duration

object TryAthena extends LazyLogging {
  def main(args: Array[String]): Unit = {
    val config = AthenaConfig("s3://valery-athena-test/", Regions.US_EAST_1.getName, "default", 10000L, 10000L)

    val athena = AmazonAthenaClient.builder
      .withRegion(config.region)
      .withCredentials(new DefaultAWSCredentialsProviderChain)
      .build()

    val client = new AwsAthenaClient(athena, config)
    val queryExecutor = new AthenaQueryExecutor(client)

    val results = new SingleBuilder[String]

    val task = queryExecutor.runTask(new ActiveQuery[String]("id", Seq("SELECT *\nFROM default.elb_logs\nLIMIT 1000"), User("valeryf")), results)

    Await.ready(task.runToFuture(Scheduler.global), Duration.Inf)

    logger.info("results = " + results.build())
  }
}
