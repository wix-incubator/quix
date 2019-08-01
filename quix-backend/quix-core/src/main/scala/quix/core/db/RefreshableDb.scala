package quix.core.db

import monix.eval.Task
import quix.api.db.{Catalog, Db, Table, Tables}

class RefreshableDb(catalogs: RefreshableCatalogs, autocomplete: RefreshableAutocomplete, tables: Tables) extends Db {

  override def getCatalogs: Task[List[Catalog]] =
    catalogs.get

  override def getAutocomplete: Task[Map[String, List[String]]] =
    autocomplete.get

  override def getTable(catalog: String, schema: String, table: String): Task[Table] =
    tables.get(catalog, schema, table)

  override def search(query: String): Task[List[Catalog]] =
    catalogs.get.map(c => DbOps.search(c, query))
}
