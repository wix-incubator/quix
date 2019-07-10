package quix.presto.db

import monix.eval.Task
import quix.api.db.{Catalog, Schema, Table}
import quix.api.execute.{AsyncQueryExecutor, Batch}
import scala.concurrent.duration._

class PrestoCatalogs(val queryExecutor: AsyncQueryExecutor[String, Batch],
                     val timeout: Long, val stalePeriod: Long,
                     var state: State[List[Catalog]] = State(List.empty, 0L))
  extends SingleQueryExecutor {

  case class RichTable(catalog: String, schema: String, name: String)

  def get: Task[List[Catalog]] = {
    state match {
      case State(catalogs, _) if catalogs.isEmpty =>
        for {
          _ <- startUpdate()

          catalogs <- getCatalogNamesOnly
            .flatMap(update)
            .timeout(timeout.millis)
            .onErrorFallbackTo(Task.now(state.data))

          _ <- inferCatalogsInSingleQuery
            .flatMap(update)
            .attempt.start
        } yield catalogs

      case State(_, expirationDate) if expirationDate < System.currentTimeMillis() =>
        for {
          _ <- startUpdate()
          _ <- inferCatalogsInSingleQuery
            .onErrorFallbackTo(inferCatalogsOneByOne)
            .flatMap(update).attempt.start
        } yield state.data

      case _ => Task.now(state.data)
    }
  }

  def startUpdate() = Task(state = state.copy(expirationDate = System.currentTimeMillis() + stalePeriod))

  def update(newCatalogs: List[Catalog]): Task[List[Catalog]] = Task {
    if (newCatalogs.nonEmpty) {
      state = state.copy(data = newCatalogs)
    }

    newCatalogs
  }

  private def inferCatalogsOneByOne = {
    for {
      catalogNames <- executeForSingleColumn("show catalogs")
      catalogs <- Task.traverse(catalogNames)(inferSchemaOfCatalog)
    } yield catalogs
  }

  def getCatalogNamesOnly = {
    for {
      catalogNames <- executeForSingleColumn("show catalogs")
    } yield catalogNames.map(name => Catalog(name, Nil))
  }

  def inferCatalogsInSingleQuery: Task[List[Catalog]] = {
    val sql = """select distinct table_cat, table_schem, table_name from system.jdbc.tables"""
    val mapper = (row: List[String]) => RichTable(row(0), row(1), row(2))

    for (tables <- executeFor(sql, mapper)) yield {
      for ((catalogName, catalogTables) <- tables.groupBy(_.catalog).toList)
        yield {
          val schemas = for ((schemaName, schemaTables) <- catalogTables.groupBy(_.schema).toList)
            yield Schema(schemaName, schemaTables.map(tbl => Table(tbl.name, Nil)))

          Catalog(catalogName, schemas)
        }
    }
  }

  private def inferSchemaOfCatalog(catalogName: String) = {
    val fastQueryInference = inferSchemaInOneQuery(catalogName)
    val slowQueryInference = inferSchemaOneByOne(catalogName)
    val emptyCatalog = Task.now(Catalog(catalogName, List.empty))

    fastQueryInference
      .onErrorFallbackTo(slowQueryInference)
      .onErrorFallbackTo(emptyCatalog)
  }

  def inferSchemaInOneQuery(catalogName: String): Task[Catalog] = {
    val sql =
      s"""select distinct table_cat, table_schem, table_name
         |from system.jdbc.tables
         |where table_cat = '$catalogName'
         |and table_schem != 'information_schema'""".stripMargin

    val mapper: List[String] => RichTable = {
      case List(catalog, schema, name) => RichTable(catalog, schema, name)
    }

    for {
      tables <- executeFor(sql, mapper)
    } yield {
      val schemas = tables.groupBy(_.schema).map {
        case (schema, schemaTables) =>
          val tables = schemaTables.map(table => Table(table.name, List()))
          Schema(schema, tables.sortBy(_.name))
      }

      Catalog(catalogName, schemas.toList.sortBy(_.name))
    }
  }

  def inferSchemaOneByOne(catalogName: String): Task[Catalog] = {
    val sql = s"select distinct table_schem from system.jdbc.schemas " +
      s"where table_catalog = '$catalogName' and table_schem not in ('information_schema');"

    for {
      schemaNames <- executeForSingleColumn(sql)
      schemas <- Task.traverse(schemaNames)(schema => inferTablesOfSchema(catalogName, schema).map(tables => Schema(schema, tables)))
    } yield Catalog(catalogName, schemas)
  }

  def inferTablesOfSchema(catalogName: String, schemaName: String): Task[List[Table]] = {
    val sql = s"select distinct table_name from system.jdbc.tables " +
      s"where table_cat = '$catalogName' and table_schem = '$schemaName';"

    val task = for {
      tables <- executeForSingleColumn(sql)
    } yield {
      tables.sorted.map(name => Table(name, List.empty))
    }

    task.onErrorFallbackTo(Task.eval(List.empty))
  }
}
