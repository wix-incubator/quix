package quix.athena

import java.net.{ConnectException, SocketException, SocketTimeoutException}

import com.amazonaws.SdkClientException
import com.amazonaws.auth._
import com.amazonaws.services.athena.AmazonAthenaClient
import com.amazonaws.services.athena.model.{AmazonAthenaException, GetQueryResultsResult, QueryExecutionState, StartQueryExecutionResult, Row => AthenaRow}
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v1.execute.{Batch, BatchColumn}
import quix.api.v2.execute._
import quix.core.utils.TaskOps._

import scala.concurrent.duration.{FiniteDuration, _}

class AthenaQueryExecutor(val client: AthenaClient,
                          val initialAdvanceDelay: FiniteDuration = 100.millis,
                          val maxAdvanceDelay: FiniteDuration = 15.seconds)
  extends Executor with LazyLogging {

  def waitLoop(queryId: String, activeQuery: SubQuery, builder: Builder, delay: FiniteDuration = initialAdvanceDelay): Task[QueryExecutionState] = {
    val runningStatuses = Set(QueryExecutionState.RUNNING, QueryExecutionState.QUEUED).map(_.toString)
    val failed = Set(QueryExecutionState.FAILED, QueryExecutionState.CANCELLED).map(_.toString)

    client.get(queryId).map(_.getQueryExecution).flatMap {
      case query if runningStatuses.contains(query.getStatus.getState) && !activeQuery.canceled.get =>
        for {
          _ <- Task(logger.info(s"method=waitLoop event=not-finished query-id=$queryId user=${activeQuery.user.email} status=${query.getStatus.getState} delay=$delay"))
          _ <- builder.addSubQuery(queryId, Batch(data = List.empty))
          status <- waitLoop(queryId, activeQuery, builder, maxAdvanceDelay.min(delay * 2)).delayExecution(delay)
        } yield status

      case query if failed.contains(query.getStatus.getState) =>
        for {
          _ <- Task(logger.info(s"method=waitLoop event=failed query-id=$queryId user=${activeQuery.user.email} delay=$delay status=${query.getStatus.getState} canceled=${activeQuery.canceled.get}"))
          _ <- builder.errorSubQuery(queryId, new IllegalStateException(s"Query failed with status ${query.getStatus.getState} with reason = ${query.getStatus.getStateChangeReason}"))
        } yield QueryExecutionState.fromValue(query.getStatus.getState)

      case query if query.getStatus.getState == QueryExecutionState.SUCCEEDED.toString || activeQuery.canceled.get =>
        Task.eval(logger.info(s"method=waitLoop event=finished query-id=$queryId user=${activeQuery.user.email} delay=$delay status=${query.getStatus.getState} canceled=${activeQuery.canceled.get}"))
          .map(_ => QueryExecutionState.fromValue(query.getStatus.getState))
    }
  }

  def drainResults(queryId: String, nextToken: Option[String], builder: Builder, query: SubQuery): Task[Option[String]] = {
    val log = Task(logger.info(s"method=drainResults event=start query-id=$queryId user=${query.user.email} tokenOpt=$nextToken"))

    val tokenTask = nextToken match {
      case Some(_) if !query.canceled.get =>
        for {
          nextState <- advance(builder, queryId, query, nextToken)

          _ <- builder.addSubQuery(queryId, makeBatch(nextState))

          futureState <- drainResults(queryId, Option(nextState.getNextToken), builder, query)
        } yield futureState

      case _ =>
        Task.now(nextToken)
    }

    log.flatMap(_ => tokenTask)
  }

  def fetchFirstBatch(queryId: String, builder: Builder, query: SubQuery): Task[Option[String]] = {
    val log = Task(logger.info(s"method=fetchFirstBatch event=start query-id=$queryId user=${query.user.email} cancelled=${query.canceled.get()}"))

    val batch = if (query.canceled.get) Task.now(None)
    else for {
      state <- advance(builder, queryId, query)
      _ <- builder.addSubQuery(queryId, makeBatch(state, isFirst = true))
      _ <- Task(logger.info(s"method=fetchFirstBatch event=done query-id=$queryId user=${query.user.email} cancelled=${query.canceled.get()} tokenOpt=${state.getNextToken}"))
    } yield Option(state.getNextToken)

    log.flatMap(_ => batch)
  }

  def makeBatch(result: GetQueryResultsResult, isFirst: Boolean = false): Batch = {
    logger.info(s"method=makeBatch event=start isFirst=$isFirst rows=${result.getResultSet.getRows.size()}")

    import scala.collection.JavaConverters._
    // first batch contains columns as first row

    val columns = if (isFirst) {
      val rs = result.getResultSet
      Option(rs.getResultSetMetadata.getColumnInfo.asScala.map(col => BatchColumn(col.getName)).toList)
    } else None

    val types = result.getResultSet.getResultSetMetadata.getColumnInfo.asScala.map(_.getType)

    val res = result.getResultSet

    val rows = res.getRows.asScala.toList

    val data = for ((row, index) <- rows.zipWithIndex if !columnsRow(row, index, columns))
      yield {
        for ((datatype, datum) <- types.zip(row.getData.asScala.map(_.getVarCharValue)).toList)
          yield convert(datatype, datum)
      }

    Batch(data = data, columns = columns)
  }

  /*
    athena docs states that first row contains column names, we need to skip that row
   */
  def columnsRow(row: AthenaRow, index: Int, maybeColumns: Option[List[BatchColumn]]) = {
    import scala.collection.JavaConverters._

    if (index == 0) {
      val values = row.getData.asScala.map(_.getVarCharValue).toList
      val types = maybeColumns.map(_.map(_.name)).getOrElse(Nil)

      values == types
    } else false
  }

  def convert(datatype: String, datum: String): AnyRef = {
    datatype match {
      case "varchar" => String.valueOf(datum)
      case "tinyint" => new Integer(datum)
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

  def advance(builder: Builder, queryId: String, query: SubQuery, token: Option[String] = None): Task[GetQueryResultsResult] = {

    client.advance(queryId, token)
      .onErrorHandleWith {
        case e@(_: ConnectException | _: SocketTimeoutException | _: SocketException) =>
          val ex = new IllegalStateException(s"Athena can't be reached, please try later. Underlying exception name is ${e.getClass.getSimpleName}", e)
          builder.errorSubQuery(queryId, ex)
            .flatMap(_ => Task.raiseError(ex))

        case ex: Exception =>
          val log = Task(logger.warn(s"method=advance event=error query-id=$queryId user=${query.user.email} cancelled=${query.canceled.get()}", ex))

          builder.errorSubQuery(queryId, ex)
            .flatMap(_ => log)
            .flatMap(_ => Task.raiseError(ex))
      }
  }

  def execute(query: SubQuery, builder: Builder): Task[Unit] = {
    val close = (startExecution: StartQueryExecutionResult) => client.close(startExecution.getQueryExecutionId)

    initClient(query, builder).bracket { startExecution =>
      val queryLoop = for {
        queryState <- waitLoop(startExecution.getQueryExecutionId, query, builder, initialAdvanceDelay)
        _ <- if (queryState == QueryExecutionState.SUCCEEDED) {
          for {
            token <- fetchFirstBatch(startExecution.getQueryExecutionId, builder, query)
            _ <- drainResults(startExecution.getQueryExecutionId, token, builder, query)
          } yield ()
        } else Task.unit
      } yield ()

      for {
        _ <- Task.eval(logger.info(s"method=runAsync event=start query-id=${query.id} user=${query.user.email} " +
          s"sql=${query.text.replace("\n", "-newline-").replace("\\s", "-space-")}"))

        _ <- builder.startSubQuery(startExecution.getQueryExecutionId, query.text)
        _ <- queryLoop.onErrorFallbackTo(Task.unit)
        _ <- builder.endSubQuery(startExecution.getQueryExecutionId)

        _ <- Task.eval(logger.info(s"method=runAsync event=end query-id=${query.id} user=${query.user.email} rows=${builder.rowCount}"))
      } yield ()
    }(close)
  }

  def initClient(query: SubQuery, builder: Builder): Task[StartQueryExecutionResult] = {
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
    val credentials = {
      if (config.accessKey != null && config.secretKey != null && config.accessKey.nonEmpty && config.secretKey.nonEmpty) {
        new AWSCredentialsProvider {
          override def getCredentials: AWSCredentials = new BasicAWSCredentials(config.accessKey, config.secretKey)

          override def refresh(): Unit = {}
        }
      } else new DefaultAWSCredentialsProviderChain
    }

    val athena = AmazonAthenaClient.builder
      .withRegion(config.region)
      .withCredentials(credentials)
      .build()

    val client = new AwsAthenaClient(athena, config)
    new AthenaQueryExecutor(client)
  }
}