package quix.presto.db

import java.util.UUID

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.Scheduler
import quix.api.db._
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, Results}
import quix.api.users.User
import quix.core.utils.Chores
import quix.presto.SingleResultBuilder

import scala.concurrent.Await
import scala.concurrent.duration._

class RefreshableDb(val queryExecutor: AsyncQueryExecutor[Results],
                    val state: DbState = new DbState())
  extends Db with Chores with LazyLogging {

  val io: Scheduler = Scheduler.io("quix-db-tree")
  val user = User("quix-db-tree")

  override def table(catalog: String, schema: String, table: String): Table = {
    val sql =
      s"""select column_name, type_name
         |from system.jdbc.columns
         |where table_cat = '$catalog'
         |and table_schem = '$schema'
         |and table_name = '$table'""".stripMargin

    val mapper: List[String] => Kolumn = {
      case List(name, kind) => Kolumn(name, kind)
    }

    val tableTask = for {
      _ <- Task(logger.info(s"event=get-table-start $catalog.$schema.$table"))
      startMillis <- Task(System.currentTimeMillis())
      columns <- executeFor(sql, mapper).timeout(5.seconds).onErrorFallbackTo(Task(Nil))
      endMillis <- Task(System.currentTimeMillis())
      _ <- Task(logger.info(s"event=get-table-finish $catalog.$schema.$table millis=${endMillis - startMillis} seconds=${(endMillis - startMillis) / 1000.0}"))
    } yield Table(table, columns)

    val tableFuture = tableTask.executeOn(io).runToFuture(io)

    Await.result(tableFuture, 6.seconds)
  }

  override def catalogs: List[Catalog] = {
    if (state.catalogs.isEmpty) {
      val catalogsTask = for {
        newCatalogs <- Catalogs.inferCatalogsInSingleQuery
        _ <- Task(state.catalogs = newCatalogs)
      } yield newCatalogs

      Await.result(catalogsTask.timeout(4.seconds).onErrorFallbackTo(Task(Nil)).runToFuture(io), 5.seconds)
    } else state.catalogs
  }

  override def autocomplete: Map[String, List[String]] = {
    if (state.autocomplete.isEmpty) {
      val autocompleteTask = for {
        newAutocomplete <- Autocomplete.get(catalogs)
        _ <- Task(state.autocomplete = newAutocomplete)
      } yield newAutocomplete

      Await.result(autocompleteTask.timeout(4.seconds).onErrorFallbackTo(Task(Map.empty[String, List[String]])).runToFuture(io), 5.seconds)
    } else state.autocomplete
  }

  def executeForSingleColumn(sql: String, delim: String = "") = {
    executeFor[String](sql, x => x.mkString(delim))
  }

  def executeFor[T](sql: String, resultMapper: List[String] => T) = {
    val query = ActiveQuery(UUID.randomUUID().toString, sql, 1, user, false, Map.empty)
    val resultBuilder = new SingleResultBuilder
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

  override def chore(): Unit = {
    val startMillis = System.currentTimeMillis()

    val task = for {
      _ <- Task.eval(logger.info(s"event=db-refresh-chore-start"))

      newCatalogs <- Catalogs.get
      _ <- Task.eval {
        state.catalogs = RefreshableDb.mergeNewAndOldCatalogs(newCatalogs, state.catalogs)
      }

      autocomplete <- Autocomplete.get(newCatalogs)
      _ <- Task(state.autocomplete = autocomplete)

      _ <- Task.eval(logger.info(s"event=db-refresh-chore-finish millis=${System.currentTimeMillis() - startMillis}"))
    } yield ()

    task.runToFuture(io)
  }

  def reset = {
    state.catalogs = Nil
    state.autocomplete = Map.empty
  }
}

class DbState(var catalogs: List[Catalog] = Nil, var autocomplete: Map[String, List[String]] = Map.empty)

object RefreshableDb extends LazyLogging {

  def mergeNewAndOldCatalogs(newCatalogs: List[Catalog], oldCatalogs: List[Catalog]): List[Catalog] = {
    newCatalogs.map { newCatalog =>
      val maybeOldCatalog = oldCatalogs.find(_.name == newCatalog.name)

      (newCatalog, maybeOldCatalog) match {
        case (_, None) =>
          newCatalog

        case (_, Some(oldCatalog)) if newCatalog.children.isEmpty =>
          logger.warn("Catalog " + newCatalog + "is empty")
          oldCatalog

        case _ =>
          newCatalog
      }
    }
  }
}