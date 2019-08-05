package quix.bigquery

import monix.eval.Task
import quix.api.db.{Catalog, Catalogs, Schema, Table}
import quix.api.execute.{AsyncQueryExecutor, Batch}
import quix.core.executions.SingleQueryExecutor

class BigQueryCatalogs1(val queryExecutor: AsyncQueryExecutor[String, Batch]) extends Catalogs with SingleQueryExecutor {
  override def fast: Task[List[Catalog]] = ???

  override def full: Task[List[Catalog]] = ???
}
