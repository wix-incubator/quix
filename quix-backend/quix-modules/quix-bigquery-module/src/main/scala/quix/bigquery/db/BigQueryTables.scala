package quix.bigquery.db

import monix.eval.Task
import quix.api.db._
import quix.api.execute.{AsyncQueryExecutor, Batch}
import quix.core.executions.SingleQueryExecutor

import scala.concurrent.duration._

class BigQueryTables(val queryExecutor: AsyncQueryExecutor[String, Batch],
                     val timeout: Long) extends Tables with SingleQueryExecutor {

  override def get(catalog: String, schema: String, table: String): Task[Table] = {
    val sql = s"describe `$schema`.`$table`"

    val mapper: List[String] => Kolumn = {
      case List(nameAndType) =>
        nameAndType.split("\\s+") match {
          case Array(name, kind) => Kolumn(name, kind)
          case _ => Kolumn(nameAndType, "unknown")
        }
    }

    for {
      columns <- executeFor(sql, mapper)
        .timeout(timeout.millis)
        .onErrorFallbackTo(Task(Nil))
    } yield Table(table, columns.filter(_.name.trim.nonEmpty).filterNot(_.name.startsWith("# ")).distinct)
  }
}