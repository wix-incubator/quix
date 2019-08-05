package quix.bigquery

import java.util.UUID

import com.google.cloud.bigquery.{BigQueryOptions, JobId, JobInfo, QueryJobConfiguration}
import com.typesafe.scalalogging.LazyLogging

object TryBigQuery extends LazyLogging {

  def main(args: Array[String]): Unit = {

    /**
      * Set in your environment configuration the value for GOOGLE_APPLICATION_CREDENTIALS with the full path to the json files provided by Google, as described here:
      * https://cloud.google.com/iam/docs/creating-managing-service-account-keys
      */
    System.out.println(s"Value for GOOGLE_APPLICATION_CREDENTIALS set: ${System.getenv("GOOGLE_APPLICATION_CREDENTIALS")}")

    val bigquery = BigQueryOptions.getDefaultInstance.getService

    /**
      * Enter your full query. For example:
      * "SELECT count(*) FROM `organization.dataset.table`;"
       */
    val query = "SELECT count(*) FROM `wixgamma.babynames.names2010`;"
    val queryConfig = QueryJobConfiguration.newBuilder(query).build

    // Create a job ID so that we can safely retry.
    val jobId = JobId.of(UUID.randomUUID.toString)
    var queryJob = bigquery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build)

    // Wait for the query to complete.
    queryJob = queryJob.waitFor()

    // Check for errors
    if (queryJob == null) throw new RuntimeException("Job no longer exists")
    else if (queryJob.getStatus.getError != null) { // You can also look at queryJob.getStatus().getExecutionErrors() for all
      // errors, not just the latest one.
      throw new RuntimeException(queryJob.getStatus.getError.toString)
    }

    // Get the results.
    val result = queryJob.getQueryResults()
    System.out.printf(s"Result: ${result.getValues}")
  }
}
