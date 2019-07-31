package quix.jdbc

import monix.eval.Task
import quix.api.db.{Autocomplete, Catalog}

class JdbcAutocomplete(val catalogs: JdbcCatalogs) extends Autocomplete {
  override def fast: Task[Map[String, List[String]]] = {
    catalogs.fast.map(toAutocompleteItems)
  }

  override def full: Task[Map[String, List[String]]] =
    catalogs.full.map(toAutocompleteItems)

  def toAutocompleteItems(catalogList: List[Catalog]) = {
    Map(
      "catalogs" -> catalogList.map(_.name),
      "schemas" -> catalogList.flatMap(_.children.map(_.name)),
      "tables" -> catalogList.flatMap(_.children.flatMap(_.children.map(_.name))))
  }
}
