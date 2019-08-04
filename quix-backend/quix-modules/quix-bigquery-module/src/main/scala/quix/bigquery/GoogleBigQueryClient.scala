package quix.bigquery
import com.google.cloud.bigquery.BigQuery
import com.google.cloud.bigquery.BigQuery
import com.google.cloud.bigquery.BigQueryOptions
import com.google.cloud.bigquery.FieldValueList
import com.google.cloud.bigquery.Job
import com.google.cloud.bigquery.JobId
import com.google.cloud.bigquery.JobInfo
import com.google.cloud.bigquery.QueryJobConfiguration
import com.google.cloud.bigquery.QueryResponse
import com.google.cloud.bigquery.TableResult
import java.util.UUID

import com.google.auth.Credentials

class GoogleBigQueryClient extends BigQueryClient {

  def init(credentials: Credentials): BigQuery = BigQueryOptions.newBuilder().setCredentials(credentials).build().getService
}
