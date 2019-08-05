package quix.bigquery

import java.util.UUID

import com.google.cloud.bigquery.{BigQueryOptions, JobId, JobInfo, QueryJobConfiguration}
import com.typesafe.scalalogging.LazyLogging

import scala.collection.JavaConverters._

object TryBigQueryOnWeb extends LazyLogging {

  def main(args: Array[String]): Unit = {

    /**
      * Set in your environment configuration the value for GOOGLE_APPLICATION_CREDENTIALS with the full path to the json files provided by Google, as described here:
      * https://cloud.google.com/iam/docs/creating-managing-service-account-keys
      */
    System.out.println(s"Value for GOOGLE_APPLICATION_CREDENTIALS set: ${System.getenv("GOOGLE_APPLICATION_CREDENTIALS")}")

    val bigquery = BigQueryOptions.getDefaultInstance.getService

    val queryConfig = QueryJobConfiguration
      .newBuilder(
        "SELECT "
          + "CONCAT('https://stackoverflow.com/questions/', CAST(id as STRING)) as url, "
          + "view_count "
          + "FROM `bigquery-public-data.stackoverflow.posts_questions` "
          + "WHERE tags like '%google-bigquery%' "
          + "ORDER BY favorite_count DESC LIMIT 10"
      )
      .setUseLegacySql(false)
      .build

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

    // Print all pages of the results.
    result.iterateAll().asScala.foreach { row =>
      val url = row.get("url").getStringValue
      val viewCount = row.get("view_count").getLongValue
      System.out.printf(s"url: $url views: $viewCount\n")
    }
  }
}
