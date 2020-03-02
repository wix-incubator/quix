package quix.athena

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.athena.AmazonAthenaClient
import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler.Implicits.global
import quix.api.v1.users.User
import quix.api.v2.execute.ImmutableSubQuery
import quix.core.results.SingleBuilder

object TryAthena extends LazyLogging {
  def main(args: Array[String]): Unit = {
    val config = AthenaConfig("s3://valery-athena-test/", Regions.US_EAST_1.getName, "default", 10000L, 10000L)

    val athena = AmazonAthenaClient.builder
      .withRegion(config.region)
      .withCredentials(new DefaultAWSCredentialsProviderChain)
      .build()

    val client = new AwsAthenaClient(athena, config)
    val queryExecutor = new AthenaQueryExecutor(client)

    val results = new SingleBuilder

    val task = queryExecutor.execute(ImmutableSubQuery("SELECT *\nFROM default.elb_logs\nLIMIT 1000", User("valeryf")), results)

    task.runSyncUnsafe()

    logger.info("results = " + results.build())
  }
}
