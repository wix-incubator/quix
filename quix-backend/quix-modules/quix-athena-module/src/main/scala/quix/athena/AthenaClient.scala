package quix.athena

import com.amazonaws.services.athena.model.{GetQueryExecutionResult, GetQueryResultsResult, StartQueryExecutionResult}
import monix.eval.Task
import quix.api.execute.ActiveQuery

trait AthenaClient {
  def init(query: ActiveQuery[String]): Task[StartQueryExecutionResult]

  def get(queryId: String): Task[GetQueryExecutionResult]

  def advance(queryId: String, tokenOpt: Option[String] = None): Task[GetQueryResultsResult]

  def close(queryId: String): Task[Unit]
}
