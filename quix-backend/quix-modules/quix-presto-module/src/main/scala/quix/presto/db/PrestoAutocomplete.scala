package quix.presto.db

import monix.eval.Task
import quix.api.v1.db.{Autocomplete, Catalog}
import quix.api.v2.execute.Executor
import quix.core.executions.SingleQueryExecutor

class PrestoAutocomplete(val catalogs: PrestoCatalogs,
                         val queryExecutor: Executor)
  extends Autocomplete with SingleQueryExecutor {

  override def fast: Task[Map[String, List[String]]] = {
    catalogs.fast.flatMap(singleQueryAutocomplete)
  }

  override def full: Task[Map[String, List[String]]] = {
    catalogs.full.flatMap(singleQueryAutocomplete)
  }

  def singleQueryAutocomplete(catalogList: List[Catalog]) = {
    for {
      catalogs <- Task.now(catalogList.map(_.name))
      schemas <- Task.now(catalogList.flatMap(_.children.map(_.name)))
      tables <- Task.now(catalogList.flatMap(_.children.flatMap(_.children.map(_.name))))
      columns <- executeForSingleColumn("select distinct column_name from system.jdbc.columns")
        .onErrorFallbackTo(Task(List.empty[String]))
    } yield Map("catalogs" -> catalogs, "schemas" -> schemas, "tables" -> tables, "columns" -> columns)
  }

}
