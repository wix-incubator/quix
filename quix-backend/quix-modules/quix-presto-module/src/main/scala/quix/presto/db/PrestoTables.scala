package quix.presto.db

import monix.eval.Task
import quix.api.v1.db.{Kolumn, Table, Tables}
import quix.api.v2.execute.Executor
import quix.core.executions.SingleQueryExecutor

import scala.concurrent.duration._

class PrestoTables(val queryExecutor: Executor, val timeout: Long)
  extends Tables with SingleQueryExecutor {

  override def get(catalog: String, schema: String, table: String): Task[Table] = {
    val sql =
      s"""select column_name, type_name
         |from system.jdbc.columns
         |where table_cat = '$catalog'
         |and table_schem = '$schema'
         |and table_name = '$table'""".stripMargin

    val mapper: List[String] => Kolumn = {
      case List(name, kind) => Kolumn(name, kind)
    }

    for {
      columns <- executeFor(sql, mapper)
        .timeout(timeout.millis)
        .onErrorFallbackTo(Task(Nil))

    } yield Table(table, columns)
  }
}
