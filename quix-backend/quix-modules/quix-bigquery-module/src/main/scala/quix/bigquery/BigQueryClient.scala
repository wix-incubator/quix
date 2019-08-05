package quix.bigquery

import com.google.auth.Credentials
import com.google.cloud.bigquery.{BigQuery, TableResult}
import monix.eval.Task
import quix.api.execute.ActiveQuery

trait BigQueryClient {

  def init(query: ActiveQuery[String]): Task[TableResult]

  def close(queryId: String): Task[Unit]



  /*  def init(query: ActiveQuery[String]): Task[StartQueryExecutionResult]

    def get(queryId: String): Task[GetQueryExecutionResult]

    def advance(queryId: String, tokenOpt: Option[String] = None): Task[GetQueryResultsResult]

    def close(queryId: String): Task[Unit]



    def init(query: ActiveQuery[String]): Task[PrestoState]

    def advance(uri: String): Task[PrestoState]

    def close(state: PrestoState): Task[Unit]

    def info(state: PrestoState): Task[PrestoQueryInfo]

    def health(): Task[PrestoHealth]*/
}
