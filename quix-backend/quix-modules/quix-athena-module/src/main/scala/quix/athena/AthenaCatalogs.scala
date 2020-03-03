package quix.athena

import monix.eval.Task
import quix.api.v1.db.{Catalog, Catalogs, Schema, Table}
import quix.api.v2.execute.Executor
import quix.core.executions.SingleQueryExecutor

class AthenaCatalogs(val queryExecutor: Executor) extends Catalogs with SingleQueryExecutor {

  override def fast: Task[List[Catalog]] = {
    for {schemas <- executeForSingleColumn("show databases")}
      yield List(Catalog("__root", schemas.map(schema => Schema(schema, Nil))))
  }

  override def full: Task[List[Catalog]] = {
    for {
      schemaNames <- executeForSingleColumn("show databases")
      schemas <- Task.traverse(schemaNames)(inferSchemaInOneQuery)
    } yield List(Catalog("__root", schemas))
  }

  def inferSchemaInOneQuery(schemaName: String): Task[Schema] = {
    val sql = s"show tables in `$schemaName`"

    for {
      tablesNames <- executeForSingleColumn(sql)
    } yield {
      val tables = tablesNames.map(table => Table(table, List()))
      Schema(schemaName, tables.sortBy(_.name))
    }
  }
}
