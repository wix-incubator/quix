package quix.bigquery.db

import monix.eval.Task
import quix.api.v1.db._
import quix.api.v2.execute.Executor
import quix.core.executions.SingleQueryExecutor

import scala.concurrent.duration._

class BigQueryTables(val queryExecutor: Executor,
                     val timeout: Long) extends Tables with SingleQueryExecutor {

  override def get(catalog: String, schema: String, table: String): Task[Table] = {
    val sql =
      s"""SELECT column_name, data_type
         |FROM `$schema.INFORMATION_SCHEMA.COLUMNS` WHERE table_name='$table'
       """.stripMargin

    val mapper: List[String] => Kolumn = {
      case List(name, kind) => Kolumn(name, kind)
      case row => Kolumn(row.mkString, "unknown")
    }

    for {
      columns <- executeFor(sql, mapper)
        .timeout(timeout.millis)
        .onErrorFallbackTo(Task(Nil))
    } yield Table(table, columns.filter(_.name.trim.nonEmpty).filterNot(_.name.startsWith("# ")).distinct)
  }
}