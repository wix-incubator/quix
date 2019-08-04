package quix.bigquery

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
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


import scala.concurrent.duration.{FiniteDuration, _}

class BigqueryQueryExecutor(val initialAdvanceDelay: FiniteDuration = 100.millis,
                            val maxAdvanceDelay: FiniteDuration = 15.seconds)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  val bigquery: BigQuery = BigQueryOptions.getDefaultInstance.getService


  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = ???
}


object BigqueryQueryExecutor {
  def apply(config: BigqueryConfig) = {

    new BigqueryQueryExecutor()
  }
}