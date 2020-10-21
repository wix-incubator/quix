package quix.athena

import com.amazonaws.services.athena.model.{GetQueryExecutionResult, GetQueryResultsResult, StartQueryExecutionResult}
import monix.eval.Task
import quix.api.v2.execute.SubQuery

trait AthenaClient {
  def init(query: SubQuery): Task[StartQueryExecutionResult]

  def get(queryId: String): Task[GetQueryExecutionResult]

  def advance(queryId: String, tokenOpt: Option[String] = None): Task[GetQueryResultsResult]

  def close(queryId: String): Task[Unit]
}
