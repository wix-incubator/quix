package quix.athena

import com.amazonaws.services.athena.AmazonAthena
import com.amazonaws.services.athena.model._
import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute.ActiveQuery

class AwsAthenaClient(athena: AmazonAthena, config: AthenaConfig) extends AthenaClient with LazyLogging {
  override def init(query: ActiveQuery[String]): Task[StartQueryExecutionResult] = Task {
    logger.info(s"method=init query-id=${query.id} query-sql=[${query.text.replace("\n", "-newline-")}] config=$config")

    val request =
      new StartQueryExecutionRequest()
        .withQueryString(query.text)
        .withResultConfiguration(new ResultConfiguration().withOutputLocation(config.output))

    athena.startQueryExecution(request)
  }

  override def get(queryId: String): Task[GetQueryExecutionResult] = Task {
    logger.info(s"""method=get query-id=$queryId config=$config""")

    val request = new GetQueryExecutionRequest()
      .withQueryExecutionId(queryId)

    athena.getQueryExecution(request)
  }

  override def advance(queryId: String, tokenOpt: Option[String] = None): Task[GetQueryResultsResult] = Task {
    logger.info(s"method=advance query-id=$queryId tokenOpt=$tokenOpt")

    val request = new GetQueryResultsRequest()
      .withQueryExecutionId(queryId)

    tokenOpt.foreach(request.withNextToken)

    athena.getQueryResults(request)
  }

  override def close(queryId: String): Task[Unit] = Task {
    logger.info(s"method=close query-id=$queryId config=$config")

    val request = new StopQueryExecutionRequest()
      .withQueryExecutionId(queryId)

    athena.stopQueryExecution(request)
  }
}
