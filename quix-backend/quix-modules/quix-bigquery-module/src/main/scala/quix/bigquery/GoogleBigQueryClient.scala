package quix.bigquery

import com.google.cloud.bigquery._
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.ActiveQuery

class GoogleBigQueryClient(bigQuery: BigQuery, config: BigQueryConfig) extends BigQueryClient with LazyLogging {

  override def init(query: ActiveQuery[String]): Task[Job] = {
    for {
      jobInfo <- Task.now(JobInfo.of(QueryJobConfiguration.newBuilder(query.text).build))
      _ <- Task(logger.info(s"method=init query-id=${query.id} query-sql=[${query.text.replace("\n", "-newline-")}] config=$config"))
    } yield bigQuery.create(jobInfo)
  }

  override def close(jobId: String): Task[Unit] = {
    for {
      _ <- Task(logger.info(s"method=close job-id=$jobId config=$config"))
      _ <- Task(bigQuery.cancel(jobId)).attempt
    } yield ()
  }
}
