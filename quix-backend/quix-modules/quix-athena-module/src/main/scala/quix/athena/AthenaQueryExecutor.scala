package quix.athena

import java.net.{ConnectException, SocketException, SocketTimeoutException}

import com.amazonaws.SdkClientException
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.services.athena.AmazonAthenaClient
import com.amazonaws.services.athena.model._
import monix.eval.Task
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.concurrent.duration.{FiniteDuration, _}

class AthenaQueryExecutor(val client: AthenaClient,
                          val initialAdvanceDelay: FiniteDuration = 100.millis,
                          val maxAdvanceDelay: FiniteDuration = 33.seconds)
  extends AsyncQueryExecutor[String, Batch] {

  def waitLoop(queryId: String, activeQuery: ActiveQuery[String], builder: Builder[String, Batch], delay: FiniteDuration = initialAdvanceDelay): Task[QueryExecution] = {
    val runningStatuses = Set(QueryExecutionState.RUNNING, QueryExecutionState.QUEUED).map(_.toString)
    val failed = Set(QueryExecutionState.FAILED, QueryExecutionState.CANCELLED).map(_.toString)

    client.get(queryId).map(_.getQueryExecution).flatMap {
      case query if runningStatuses.contains(query.getStatus.getState) && !activeQuery.isCancelled =>
        for {
          _ <- builder.addSubQuery(queryId, Batch(data = List.empty, stats = Option(BatchStats(query.getStatus.getState, 0))))
          status <- waitLoop(queryId, activeQuery, builder, delay * 2).delayExecution(delay)
        } yield status

      case query if failed.contains(query.getStatus.getState) =>
        for {
          _ <- builder.errorSubQuery(queryId, new IllegalStateException(s"Query failed with status ${query.getStatus.getState} with reason = ${query.getStatus.getStateChangeReason}"))
        } yield query

      case query if query.getStatus.getState == QueryExecutionState.SUCCEEDED.toString || activeQuery.isCancelled =>
        Task.now(query)
    }
  }

  def drainResults(queryId: String, nextToken: Option[String], builder: Builder[String, Batch], query: ActiveQuery[String]): Task[Option[String]] = {
    nextToken match {
      case Some(token) if !query.isCancelled =>
        for {
          nextState <- advance(token, builder, queryId, query)

          _ <- builder.addSubQuery(queryId, makeBatch(nextState))

          futureState <- drainResults(queryId, Option(nextState.getNextToken), builder, query)
        } yield futureState

      case _ =>
        Task.now(nextToken)
    }
  }

  def fetchFirstBatch(queryId: String, builder: Builder[String, Batch], query: ActiveQuery[String]): Task[Option[String]] = {
    if (query.isCancelled) Task.now(None)
    else for {
      state <- advance(queryId, builder, queryId, query)
      _ <- builder.addSubQuery(queryId, makeBatch(state, isFirst = true))
    } yield Option(state.getNextToken)
  }

  def makeBatch(result: GetQueryResultsResult, isFirst: Boolean = false): Batch = {
    import scala.collection.JavaConverters._
    // first batch contains columns as first row

    val columns = if (isFirst) {
      val rs = result.getResultSet
      Option(rs.getResultSetMetadata.getColumnInfo.asScala.map(col => BatchColumn(col.getName)).toList)
    } else None

    val types = result.getResultSet.getResultSetMetadata.getColumnInfo.asScala.map(_.getType)

    val res = result.getResultSet

    val rows = if (isFirst) res.getRows.asScala.toList.drop(1) else res.getRows.asScala.toList

    val data = for (row <- rows)
      yield {
        for ((datatype, datum) <- types.zip(row.getData.asScala.map(_.getVarCharValue)).toList)
          yield convert(datatype, datum)
      }

    Batch(data = data, columns = columns)
  }

  def convert(datatype: String, datum: String): AnyRef = {
    datatype match {
      case "varchar" => String.valueOf(datum)
      case "tinyint" => new Integer(datum)
      case "smallint" => new Integer(datum)
      case "smallint" => new Integer(datum)
      case "integer" => new Integer(datum)
      case "bigint" => new java.lang.Long(datum)
      case "double" => new java.lang.Double(datum)
      case "boolean" => new java.lang.Boolean(datum)
      case "date" => String.valueOf(datum)
      case "timestamp" => String.valueOf(datum)
      case _ => String.valueOf(datum.toString)
    }
  }

  def advance(token: String, builder: Builder[String, Batch], queryId: String, query: ActiveQuery[String]): Task[GetQueryResultsResult] = {
    client.advance(queryId, Option(token))
      .onErrorHandleWith {
        case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
          val ex = new IllegalStateException(s"Athena can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}", e)
          builder.errorSubQuery(queryId, ex)
            .flatMap(_ => Task.raiseError(ex))

        case ex: Exception =>
          builder.errorSubQuery(queryId, ex)
            .flatMap(_ => Task.raiseError(ex))
      }
  }

  def runTask(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[Unit] = {
    val close = (startExecution: StartQueryExecutionResult) => client.close(startExecution.getQueryExecutionId)

    initClient(query, builder).bracket { startExecution =>

      val queryLoop = for {
        _ <- waitLoop(startExecution.getQueryExecutionId, query, builder, initialAdvanceDelay)
        token <- fetchFirstBatch(startExecution.getQueryExecutionId, builder, query)
        _ <- drainResults(startExecution.getQueryExecutionId, token, builder, query)
      } yield ()

      for {
        _ <- builder.startSubQuery(startExecution.getQueryExecutionId, query.text, Batch(data = List.empty))
        _ <- queryLoop.onErrorFallbackTo(Task.unit)
        _ <- builder.endSubQuery(startExecution.getQueryExecutionId)
      } yield ()
    }(close)
  }

  def initClient(query: ActiveQuery[String], builder: Builder[String, Batch]): Task[StartQueryExecutionResult] = {
    client.init(query).onErrorHandleWith {
      case e: Exception =>
        val ex = rewriteException(e)
        builder.error(query.id, ex)
          .logOnError(s"method=initClient event=error query-id=${query.id} user=${query.user.email}")
          .flatMap(_ => Task.raiseError(ex))
    }
  }

  def rewriteException(e: Exception): Exception = {
    def badCredentials(e: Exception) = {
      new IllegalStateException(
        s"""
           |Athena can't be reached, make sure you configured aws credentials correctly.
           |Refer to https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html for details.
           |Quix is using DefaultAWSCredentialsProviderChain from aws-java-sdk to discover the aws credentials.
           |
           |Underlying exception name is ${e.getClass.getSimpleName} with message [${e.getMessage}]
           |
           |""".stripMargin, e)
    }

    e match {
      case e: SdkClientException
        if e.getMessage.contains("Unable to load AWS credentials") ||
          e.getMessage.contains("Unable to load credentials") => badCredentials(e)

      case e: AmazonAthenaException if e.getMessage.contains("Check your AWS Secret Access Key") =>
        badCredentials(e)

      case e: AmazonAthenaException if e.getMessage.contains("The security token included in the request is invalid") =>
        badCredentials(e)

      case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
        new IllegalStateException(s"Athena can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}", e)
      case _ => e
    }
  }
}

object AthenaQueryExecutor {
  def apply(config: AthenaConfig) = {
    val athena = AmazonAthenaClient.builder
      .withRegion(config.region)
      .withCredentials(new DefaultAWSCredentialsProviderChain)
      .build()

    val client = new AwsAthenaClient(athena, config)
    new AthenaQueryExecutor(client)
  }
}