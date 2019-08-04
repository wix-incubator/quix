package quix.bigquery

import java.io.ByteArrayInputStream
import java.net.URI
import java.util.UUID

import com.google.api.client.http.HttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.auth.http.HttpTransportFactory
import com.google.auth.oauth2.{GoogleCredentials, OAuth2Utils, ServiceAccountCredentials}
import com.google.cloud.ServiceOptions
import com.google.cloud.bigquery.{BigQueryOptions, JobId, JobInfo, QueryJobConfiguration, QueryResponse}
import com.google.common.collect.Lists
import org.specs2.matcher.{MustMatchers, Scope}
import org.specs2.mock.Mockito
import org.specs2.mutable.{SpecWithJUnit, Specification}

import scala.collection.JavaConverters

class BigQueryClientTest  extends SpecWithJUnit with MustMatchers with Mockito {

  trait ctx extends Scope

  "BigQueryClientTest" should {
    "init" in new ctx{
  //GOOGLE_APPLICATION_CREDENTIALS=/Users/liora/work/quix/wixgamma-4a0a605d2650.json
      val json = """<json content>""".stripMargin

      val credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(json.getBytes()))
        .createScoped(Lists.newArrayList("https://www.googleapis.com/auth/cloud-platform"))

      val client  = new GoogleBigQueryClient
      val bigquery = client.init(credentials)
      val queryConfig =
        QueryJobConfiguration.newBuilder(
          "SELECT "
            + "CONCAT('https://stackoverflow.com/questions/', CAST(id as STRING)) as url, "
            + "view_count "
            + "FROM `bigquery-public-data.stackoverflow.posts_questions` "
            + "WHERE tags like '%google-bigquery%' "
            + "ORDER BY favorite_count DESC LIMIT 10")
          // Use standard SQL syntax for queries.
          // See: https://cloud.google.com/bigquery/sql-reference/
          .setUseLegacySql(false)
          .build()

      // Create a job ID so that we can safely retry.
      val jobId = JobId.of(UUID.randomUUID().toString())
      var queryJob = bigquery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build())

      // Wait for the query to complete.
      queryJob = queryJob.waitFor()

      import com.google.cloud.bigquery.FieldValueList
      import com.google.cloud.bigquery.TableResult

      val result: TableResult = queryJob.getQueryResults()

      val it = JavaConverters.asScalaIterator(result.iterateAll().iterator())
      for (row <- it) {

        val url = row.get("url").getStringValue
        val viewCount = row.get("view_count").getLongValue
        printf("url: %s views: %d%n", url, viewCount)
      }

      // Check for errors
      if (queryJob == null) {
        throw new RuntimeException("Job no longer exists")
      } else if (queryJob.getStatus().getError() != null) {
        // You can also look at queryJob.getStatus().getExecutionErrors() for all
        // errors, not just the latest one.
        throw new RuntimeException(queryJob.getStatus().getError().toString())
      }
    }

  }
}
