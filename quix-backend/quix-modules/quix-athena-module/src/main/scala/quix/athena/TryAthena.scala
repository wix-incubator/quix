package quix.athena

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.athena.AmazonAthenaClient
import com.typesafe.scalalogging.LazyLogging
import monix.execution.Scheduler

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

    val db = new AthenaDb(queryExecutor, config)

    val catalogs = Await.result(db.table("foo", "emr-airflow-poc", "emrpoctags").runToFuture(Scheduler.global), Duration.Inf)

    logger.info("results = " + catalogs)
  }
}
