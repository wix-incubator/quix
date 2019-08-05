package quix.bigquery
import java.util.UUID

import com.google.cloud.bigquery._
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.ActiveQuery

import scala.util.Try

class GoogleBigQueryClient(bigQuery: BigQuery, config: BigQueryConfig) extends BigQueryClient with LazyLogging {

  override def init(query: ActiveQuery[String]): Task[TableResult] = Task.fromTry {
    logger.info(s"method=init query-id=${query.id} query-sql=[${query.text.replace("\n", "-newline-")}] config=$config")

    for {
      queryConfig <- Try(QueryJobConfiguration.newBuilder(query.text).build)
      queryJob <- runQuery(queryConfig)
      result <- Try(queryJob.getQueryResults())
    } yield result
  }

  override def close(jobId: String): Task[Unit] = Task {
    bigQuery.cancel(jobId)
  }

  private def runQuery(queryConfig: QueryJobConfiguration): Try[Job] = {
    for {
      jobId <- Try(JobId.of(UUID.randomUUID.toString))
      queryJob <- Try(bigQuery.create(JobInfo.newBuilder(queryConfig).setJobId(jobId).build))
    } yield {
      queryJob.waitFor()
      queryJob
    }
  }
}
