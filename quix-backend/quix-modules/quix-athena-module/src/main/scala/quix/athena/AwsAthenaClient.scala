package quix.athena

import com.amazonaws.services.athena.AmazonAthena
import com.amazonaws.services.athena.model._
import monix.eval.Task
import quix.api.execute.ActiveQuery

class AwsAthenaClient(athena: AmazonAthena, config: AthenaConfig) extends AthenaClient {
  override def init(query: ActiveQuery[String]): Task[StartQueryExecutionResult] = Task {
    val request =
      new StartQueryExecutionRequest()
        .withQueryString(query.text)
        .withResultConfiguration(new ResultConfiguration().withOutputLocation(config.output))

    athena.startQueryExecution(request)
  }

  override def get(queryId: String): Task[GetQueryExecutionResult] = Task {
    val request = new GetQueryExecutionRequest()
      .withQueryExecutionId(queryId)

    athena.getQueryExecution(request)
  }

  override def advance(queryId: String, tokenOpt: Option[String] = None): Task[GetQueryResultsResult] = Task {
    val request = new GetQueryResultsRequest()
      .withQueryExecutionId(queryId)

    tokenOpt.foreach(request.withNextToken)

    athena.getQueryResults(request)
  }

  override def close(queryId: String): Task[Unit] = Task {
    val request = new StopQueryExecutionRequest()
      .withQueryExecutionId(queryId)

    athena.stopQueryExecution(request)
  }
}
