package quix.bigquery.db

import monix.eval.Task
import quix.api.db.{Autocomplete, Catalog, Catalogs}
import quix.api.execute.{AsyncQueryExecutor, Batch}

class BigQueryAutocomplete(val catalogs: Catalogs,
                           val queryExecutor: AsyncQueryExecutor[String, Batch]) extends Autocomplete {

  override def fast: Task[Map[String, List[String]]] = catalogs.fast.map(extractAutoCompleteItems)

  override def full: Task[Map[String, List[String]]] = catalogs.full.map(extractAutoCompleteItems)

  def extractAutoCompleteItems(catalogList: List[Catalog]): Map[String, List[String]] = {
    Map(
      "schemas" -> catalogList.flatMap(_.children.map(_.name)),
      "tables" -> catalogList.flatMap(_.children.flatMap(_.children.map(_.name)))
    )
  }
}
