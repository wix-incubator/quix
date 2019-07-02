package quix.presto.db

import java.util.UUID

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.db._
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, Batch}
import quix.api.users.User
import quix.core.db.DbOps
import quix.core.results.SingleBuilder

import scala.concurrent.duration._

case class RefreshableDbConfig(firstEmptyStateTimeout: FiniteDuration,
                               requestTimeout: FiniteDuration)

class PrestoRefreshableDb(val queryExecutor: AsyncQueryExecutor[String, Batch],
                          val config: RefreshableDbConfig,
                          val state: DbState = new DbState())
  extends Db with LazyLogging {

  val user = User("quix-db-tree")

  override def table(catalog: String, schema: String, table: String): Task[Table] = {
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
      _ <- Task(logger.info(s"event=get-table-start $catalog.$schema.$table"))
      startMillis <- Task(System.currentTimeMillis())

      columns <- executeFor(sql, mapper)
        .timeout(config.requestTimeout)
        .onErrorFallbackTo(Task(Nil))

      endMillis <- Task(System.currentTimeMillis())
      _ <- Task(logger.info(s"event=get-table-finish $catalog.$schema.$table millis=${endMillis - startMillis} seconds=${(endMillis - startMillis) / 1000.0}"))
    } yield Table(table, columns)

  }

  override def catalogs: Task[List[Catalog]] = {
    if (state.shouldSyncCatalogs) {
      for {
        newCatalogs <- Catalogs
          .inferCatalogsInSingleQuery
          .timeout(config.firstEmptyStateTimeout)
          .onErrorFallbackTo(Task(Nil))
        _ <- Task {
          state.catalogs = newCatalogs
          state.lastCatalogSync = System.currentTimeMillis()
        }
      } yield newCatalogs
    } else Task.now(state.catalogs)
  }

  override def autocomplete: Task[Map[String, List[String]]] = {
    if (state.autocomplete.isEmpty) {
      for {
        catalogList <- catalogs
        newAutocomplete <- Autocomplete.get(catalogList)
          .onErrorFallbackTo(Task(Map.empty[String, List[String]]))
        _ <- Task {
          state.autocomplete = newAutocomplete
          state.lastAutocompleteSync = System.currentTimeMillis()
        }
      } yield newAutocomplete
    } else Task.now(state.autocomplete)
  }

  def executeForSingleColumn(sql: String, delim: String = "") = {
    executeFor[String](sql, x => x.mkString(delim))
  }

  def executeFor[T](sql: String, resultMapper: List[String] => T) = {
    val query = ActiveQuery(UUID.randomUUID().toString, Seq(sql), user)
    val resultBuilder = new SingleBuilder[String]
    for {
      _ <- queryExecutor.runTask(query, resultBuilder)
      results <- Task.eval(resultBuilder.build())
      mapped <- Task.eval(results.map(row => resultMapper(row.map(_.toString).toList)))
      failedIfEmpty <- if (resultBuilder.isFailure) {
        Task.raiseError(new Exception("query failed"))
      } else {
        Task.eval(mapped)
      }

    } yield failedIfEmpty
  }

  object Catalogs {

    case class RichTable(catalog: String, schema: String, name: String)

    def get: Task[List[Catalog]] = {
      inferCatalogsInSingleQuery
        .onErrorFallbackTo(inferCatalogsOneByOne)
    }

    private def inferCatalogsOneByOne = {
      for {
        catalogNames <- executeForSingleColumn("show catalogs")
        catalogs <- Task.traverse(catalogNames)(inferSchemaOfCatalog)
      } yield catalogs
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

  object Autocomplete {

    def get(catalogList: List[Catalog]): Task[Map[String, List[String]]] = {
      if (catalogList.nonEmpty) singleQueryAutocomplete(catalogList) else get
    }

    def get: Task[Map[String, List[String]]] = manyQueriesAutocomplete
  }

  def singleQueryAutocomplete(catalogList: List[Catalog]) = {
    for {
      catalogs <- Task.now(catalogList.map(_.name))
      schemas <- Task.now(catalogList.flatMap(_.children.map(_.name)))
      tables <- Task.now(catalogList.flatMap(_.children.flatMap(_.children.map(_.name))))
      columns <- executeForSingleColumn("select distinct column_name from system.jdbc.columns")
    } yield Map("catalogs" -> catalogs, "schemas" -> schemas, "tables" -> tables, "columns" -> columns)
  }

  def manyQueriesAutocomplete = {
    for {
      catalogs <- executeForSingleColumn("select distinct table_cat from system.jdbc.catalogs")
      schemas <- executeForSingleColumn("select distinct table_schem from system.jdbc.schemas")
      tables <- executeForSingleColumn("select distinct table_name from system.jdbc.tables")
      columns <- executeForSingleColumn("select distinct column_name from system.jdbc.columns")
    } yield Map("catalogs" -> catalogs, "schemas" -> schemas, "tables" -> tables, "columns" -> columns)
  }

  def reset = {
    state.catalogs = Nil
    state.autocomplete = Map.empty
  }

  override def search(query: String): Task[List[Catalog]] = {
    catalogs.map(catalogList => DbOps.search(catalogList, query))
  }
}

class DbState(var catalogs: List[Catalog] = Nil,
              var autocomplete: Map[String, List[String]] = Map.empty,
              var lastCatalogSync: Long = 0L,
              var lastAutocompleteSync: Long = 0L) {

  def shouldSyncCatalogs = catalogs.isEmpty || lastCatalogSync + 5.minutes.toMillis < System.currentTimeMillis()

  def shouldSyncAutocomplete = autocomplete.isEmpty || lastAutocompleteSync + 5.minutes.toMillis < System.currentTimeMillis()
}