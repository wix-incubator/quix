package quix.presto.db

import monix.eval.Task
import quix.api.db._
import quix.api.execute.{AsyncQueryExecutor, Batch}
import quix.core.db.DbOps

import scala.concurrent.duration._

case class RefreshableDbConfig(firstEmptyStateTimeout: Long, requestTimeout: Long)

class PrestoRefreshableDb(val prestoCatalogs: PrestoCatalogs,
                          val prestoAutocomplete: PrestoAutocomplete,
                          val prestoTables: PrestoTables)
  extends Db {

  override def table(catalog: String, schema: String, table: String): Task[Table] =
    prestoTables.get(catalog, schema, table)

  override def catalogs: Task[List[Catalog]] =
    prestoCatalogs.get

  override def autocomplete: Task[Map[String, List[String]]] =
    prestoAutocomplete.get

  override def search(query: String): Task[List[Catalog]] = {
    catalogs.map(catalogList => DbOps.search(catalogList, query))
  }

  def reset = {
    prestoCatalogs.state = prestoCatalogs.state.copy(data = List.empty)
    prestoAutocomplete.state = prestoAutocomplete.state.copy(data = Map.empty)
  }
}

object PrestoRefreshableDb {
  def apply(queryExecutor: AsyncQueryExecutor[String, Batch], config: RefreshableDbConfig): PrestoRefreshableDb = {
    val catalogs = new PrestoCatalogs(queryExecutor, config.firstEmptyStateTimeout, 5.minutes.toMillis)
    val autocomplete = new PrestoAutocomplete(catalogs, queryExecutor, config.firstEmptyStateTimeout, 5.minutes.toMillis)
    val tables = new PrestoTables(queryExecutor, config.requestTimeout)

    new PrestoRefreshableDb(catalogs, autocomplete, tables)
  }
}

case class State[T](data: T, expirationDate: Long)