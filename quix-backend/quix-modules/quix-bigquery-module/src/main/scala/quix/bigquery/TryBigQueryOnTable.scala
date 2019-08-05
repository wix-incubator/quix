package quix.bigquery


import java.io.{IOException, StringReader}
import java.security.spec.{InvalidKeySpecException, PKCS8EncodedKeySpec}
import java.security.{NoSuchAlgorithmException, PrivateKey}
import java.util.UUID

import com.google.api.client.util.{PemReader, SecurityUtils}
import com.google.cloud.bigquery.{BigQueryOptions, JobId, JobInfo, QueryJobConfiguration}
import com.typesafe.scalalogging.LazyLogging

object TryBigQueryOnTable extends LazyLogging {

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
    val query = ""
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

  def privateKeyFromPkcs8(privateKeyPkcs8: String): PrivateKey = {
    val reader = new StringReader(privateKeyPkcs8)
    val section = PemReader.readFirstSectionAndClose(reader, "PRIVATE KEY")
    if (section == null) throw new IOException("Invalid PKCS#8 data.")
    else {
      val bytes = section.getBase64DecodedBytes
      val keySpec = new PKCS8EncodedKeySpec(bytes)
      try {
        val keyFactory = SecurityUtils.getRsaKeyFactory
        keyFactory.generatePrivate(keySpec)
      } catch {
        case var7@(_: InvalidKeySpecException | _: NoSuchAlgorithmException) =>
          throw new IOException("Unexpected exception reading PKCS#8 data", var7)
      }
    }
  }
}
