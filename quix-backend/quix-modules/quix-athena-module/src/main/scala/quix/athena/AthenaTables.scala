package quix.athena

import monix.eval.Task
import quix.api.v1.db._
import quix.api.v2.execute.Executor
import quix.core.executions.SingleQueryExecutor

class AthenaTables(val queryExecutor: Executor) extends Tables with SingleQueryExecutor {
  override def get(catalog: String, schema: String, table: String): Task[Table] = {
    val sql = s"describe `$schema`.`$table`"

    val mapper: List[String] => Kolumn = {
      case List(nameAndType) =>
        nameAndType.split("\\s+") match {
          case Array(name, kind) => Kolumn(name, kind)
          case _ => Kolumn(nameAndType, "unknown")
        }
    }

    for {columns <- executeFor(sql, mapper)}
      yield Table(table, columns.filter(_.name.trim.nonEmpty).filterNot(_.name.startsWith("# ")).distinct)
  }
}