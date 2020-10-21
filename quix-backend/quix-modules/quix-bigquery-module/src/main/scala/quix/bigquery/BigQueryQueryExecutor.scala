package quix.bigquery

import java.io.ByteArrayInputStream

import com.google.api.client.googleapis.json.GoogleJsonResponseException
import com.google.auth.oauth2.ServiceAccountCredentials
import com.google.cloud.bigquery.{BigQueryOptions, FieldValue, Job, JobStatistics, TableResult}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v1.execute.{Batch, BatchColumn, BatchError}
import quix.api.v2.execute.{Executor, SubQuery, _}
import quix.core.utils.TaskOps._

import scala.collection.JavaConverters._

class BigQueryQueryExecutor(val client: BigQueryClient, val advanceTimeout: Long)
  extends Executor with LazyLogging {

  def toBatch(job: Job, result: TableResult, rowsSoFar: Long): Batch = {
    val rows = for {
      row <- result.getValues.asScala.toSeq
    } yield row.asScala.map(getValue).toList

    val percentage = if (result.getTotalRows > 0) {
      ((rowsSoFar + rows.size).toDouble / result.getTotalRows * 100).toInt
    } else 0


    Batch(rows, toColumns(result), error = getError(job))
      .withPercentage(percentage)
  }

  def toColumns(result: TableResult) = {
    Option(result.getSchema).map { schema =>
      schema.getFields.asScala.map(f => BatchColumn(f.getName)).toList
    }
  }

  def getValue(value: FieldValue): Any = {
    value.getAttribute match {
      case FieldValue.Attribute.PRIMITIVE if !value.isNull =>
        value.getStringValue

      case FieldValue.Attribute.REPEATED =>
        "[" + value.getRepeatedValue.asScala.map(getValue).mkString(", ") + "]"

      case FieldValue.Attribute.RECORD =>
        "{" + value.getRecordValue.asScala.map(getValue).mkString(", ") + "}"

      case _ => null
    }
  }

  def getError(job: Job): Option[BatchError] = {
    for (error <- Option(job.getStatus.getError))
      yield BatchError(error.getMessage)
  }

  def loop(query: SubQuery, builder: Builder, job: Job, result: TableResult): Task[Unit] = {
    if (result != null && !query.canceled.get) {
      for {
        _ <- builder.addSubQuery(job.getGeneratedId, toBatch(job, result, builder.rowCount))
        nextPage <- Task(result.getNextPage)
        _ <- loop(query, builder, job, nextPage)
      } yield ()
    } else Task.unit
  }

  def waitForFinish(job: Job, activeQuery: SubQuery): Task[Job] = Task {
    job.waitFor()
  }

  override def execute(query: SubQuery, builder: Builder): Task[Unit] = {
    def close(job: Job) = client.close(job.getJobId.getJob)

    initClient(query, builder).bracket { job =>
      for {
        _ <- builder.startSubQuery(job.getGeneratedId, query.text)
        completedJob <- waitForFinish(job, query)
        _ <- loop(query, builder, completedJob, completedJob.getQueryResults()).onErrorHandleWith { e =>
          builder.errorSubQuery(job.getGeneratedId, e)
        }
        _ <- builder.endSubQuery(job.getGeneratedId, fetchStatistics(completedJob))
      } yield ()
    }(close)
  }

  def fetchStatistics(job: Job) = {
    val jobStatistics = job.getStatistics[JobStatistics.QueryStatistics]

    Map(
      "cacheHit" -> jobStatistics.getCacheHit,
      "bytesProcessed" -> jobStatistics.getTotalBytesProcessed,
      "bytesBilled" -> jobStatistics.getTotalBytesBilled,
      "type" -> jobStatistics.getStatementType.name(),
    )
  }

  def initClient(query: SubQuery, builder: Builder): Task[Job] = {
    val log = Task(logger.info(s"method=initClient event=start query-id=${query.id} user=${query.user.email} sql=${query.text}"))

    val clientTask = client
      .init(query)
      .logOnError(s"method=initClient event=error query-id=${query.id} user=${query.user.email} sql=${query.text}")
      .onErrorHandleWith {
        case e: Exception =>
          builder.error(query.id, rewriteException(e))
            .flatMap(_ => Task.raiseError(rewriteException(e)))
      }

    log.flatMap(_ => clientTask)
  }

  def rewriteException(e: Exception): Exception = {
    def badCredentials(e: Exception) = {
      new IllegalStateException(
        s"""
           |BigQuery can't be reached, make sure you configured credentials correctly from the JSON file.
           |Refer to https://cloud.google.com/iam/docs/creating-managing-service-account-keys for details.
           |
           |Underlying exception name is ${e.getClass.getSimpleName} with message [${e.getMessage}]
           |
           |""".stripMargin, e)
    }

    e match {
      case e: GoogleJsonResponseException if e.getMessage.contains("401 Unauthorized") =>
        badCredentials(e)
      case _ => e
    }
  }
}

object BigQueryQueryExecutor {

  def apply(config: BigQueryConfig) = {
    val credentials = ServiceAccountCredentials.fromStream(new ByteArrayInputStream(config.credentialBytes))

    val bigQuery = BigQueryOptions
      .newBuilder()
      .setCredentials(credentials)
      .build()
      .getService

    val client = new GoogleBigQueryClient(bigQuery, config)
    new BigQueryQueryExecutor(client, 1000L)
  }
}