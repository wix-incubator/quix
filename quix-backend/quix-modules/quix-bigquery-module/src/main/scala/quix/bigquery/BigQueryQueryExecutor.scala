package quix.bigquery

import java.io.ByteArrayInputStream

import com.google.api.client.googleapis.json.GoogleJsonResponseException
import com.google.auth.oauth2.ServiceAccountCredentials
import com.google.cloud.bigquery.{BigQueryOptions, FieldValue, Job, TableResult}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.collection.JavaConverters._
import scala.concurrent.duration._

class BigQueryQueryExecutor(val client: BigQueryClient, val advanceTimeout: Long)
  extends AsyncQueryExecutor[String, Batch] with LazyLogging {

  def toBatch(job: Job, result: TableResult, rowsSoFar: Long): Batch = {
    val rows = for {
      row <- result.getValues.asScala.toSeq
    } yield row.asScala.map(getValue)

    val percentage = if (result.getTotalRows > 0) {
      ((rowsSoFar + rows.size).toDouble / result.getTotalRows * 100).toInt
    } else 0


    Batch(rows, toColumns(result), error = getError(job))
      .withPercentage(percentage)
  }

  def toColumns(result: TableResult): Option[Seq[BatchColumn]] = {
    Option(result.getSchema).map { schema =>
      schema.getFields.asScala.map(f => BatchColumn(f.getName))
    }
  }

  def getValue(value: FieldValue): Any = {
    value.getAttribute match {
      case FieldValue.Attribute.PRIMITIVE if !value.isNull =>
        value.getStringValue

      case _ => null
    }
  }

  def getError(job: Job): Option[BatchError] = {
    for (error <- Option(job.getStatus.getError))
      yield BatchError(error.getMessage)
  }

  def loop(query: ActiveQuery[String], builder: Builder[String, Batch], job: Job, result: TableResult): Task[Unit] = {
    if (result != null && !query.isCancelled) {
      for {
        _ <- builder.addSubQuery(job.getGeneratedId, toBatch(job, result, builder.rowCount))
        nextPage <- Task(result.getNextPage)
        _ <- loop(query, builder, job, nextPage)
      } yield ()
    } else Task.unit
  }

  def waitForFinish(job: Job, activeQuery: ActiveQuery[String]): Task[Unit] = {
    Task.eval(job.isDone).flatMap {
      case false if activeQuery.isCancelled =>
        for {
          _ <- Task(job.reload()).delayExecution(advanceTimeout.millis)
          _ <- waitForFinish(job, activeQuery)
        } yield ()
      case _ => Task.unit
    }
  }

  override def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    def close(job: Job) = client.close(job.getJobId.getJob)

    initClient(query, builder).bracket { job =>
      for {
        _ <- builder.startSubQuery(job.getGeneratedId, query.text, Batch(Seq.empty, error = getError(job)))
        _ <- waitForFinish(job, query)
        _ <- loop(query, builder, job, job.getQueryResults()).onErrorHandleWith {
          e: Throwable => builder.errorSubQuery(job.getGeneratedId, e)
        }
        _ <- builder.endSubQuery(job.getGeneratedId)
      } yield ()
    }(close)
  }

  def initClient(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Job] = {
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