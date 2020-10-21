package quix.bigquery

import com.google.cloud.bigquery.Job
import monix.eval.Task
import quix.api.v2.execute.SubQuery

trait BigQueryClient {

  def init(query: SubQuery): Task[Job]

  def close(jobId: String): Task[Unit]
}
