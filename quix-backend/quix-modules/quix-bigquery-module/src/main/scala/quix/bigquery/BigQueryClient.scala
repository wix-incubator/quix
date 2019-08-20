package quix.bigquery

import com.google.cloud.bigquery.Job
import monix.eval.Task
import quix.api.execute.ActiveQuery

trait BigQueryClient {

  def init(query: ActiveQuery[String]): Task[Job]

  def close(jobId: String): Task[Unit]
}
