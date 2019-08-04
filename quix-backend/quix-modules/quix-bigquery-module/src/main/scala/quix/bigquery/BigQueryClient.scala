package quix.bigquery

import com.google.auth.Credentials
import com.google.cloud.bigquery.BigQuery

trait BigQueryClient {

  def init(credentials: Credentials): BigQuery
}
