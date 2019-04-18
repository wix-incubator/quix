package quix.presto.db

import java.util.UUID

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import monix.execution.Scheduler
import quix.api.db._
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor}
import quix.api.users.User
import quix.core.utils.Chores
import quix.presto.SingleResultBuilder
import quix.presto.rest.Results

import scala.concurrent.Await
import scala.concurrent.duration._

class RefreshableDb(val queryExecutor: AsyncQueryExecutor[Results],
                    val state: DbState = new DbState())
  extends Db with Chores with LazyLogging {

  val io: Scheduler = Scheduler.io("quix-db-tree")
  val user = User("quix-db-tree")

  override def table(catalog: String, schema: String, table: String): Table = {
    val startMillis = System.currentTimeMillis()

    logger.info(s"event=get-table-start $catalog.$schema.$table")
    val sql = s"select column_name, data_type " +
      s"from $catalog.information_schema.columns " +
      s"where table_catalog = '$catalog' " +
      s"and table_schema = '$schema' " +
      s"and table_name = '$table'"

    val mapper: List[String] => Kolumn = {
      case List(name, kind) => Kolumn(name, kind)
    }

    val tableTask = for {
      columns <- executeFor(sql, mapper)
    } yield Table(table, columns)

    val tableFuture = tableTask.executeOn(io).runToFuture(io)

    val result = Await.result(tableFuture, 10.seconds)

    val endMillis = System.currentTimeMillis()

    logger.info(s"event=get-table-finish $catalog.$schema.$table millis=${endMillis - startMillis} seconds=${(endMillis - startMillis) / 1000.0}")

    result
  }

  override def catalogs: List[Catalog] = state.catalogs

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
      for {
        catalogNames <- executeForSingleColumn("show catalogs")
        catalogs <- Task.traverse(catalogNames)(inferSchemaOfCatalog)
      } yield catalogs
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
        s"""select distinct table_catalog, table_schema, table_name
           |from $catalogName.information_schema.tables
           |where table_schema not in ('information_schema')""".stripMargin

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
      val sql =
        """
          |select distinct table_schema from mysql.information_schema.tables
          |where table_schema != 'information_schema'
        """.stripMargin

      for {
        schemaNames <- executeForSingleColumn(sql)
        schemas <- Task.traverse(schemaNames)(schema => inferTablesOfSchema(schema).map(tables => Schema(schema, tables)))
      } yield Catalog(catalogName, schemas)
    }

    def inferTablesOfSchema(schemaName: String): Task[List[Table]] = {
      val sql =
        s"""
           |select distinct table_name
           |from mysql.information_schema.columns
           |where table_schema in ('$schemaName')
        """.stripMargin

      val task = for {
        tables <- executeForSingleColumn(sql)
      } yield {
        tables.sorted.map(name => Table(name, List.empty))
      }

      task.onErrorFallbackTo(Task.eval(List.empty))
    }
  }

  object Autocomplete {

    def get: Task[Map[String, List[String]]] = {
      for {
        catalogs <- executeForSingleColumn("select distinct table_cat from system.jdbc.catalogs")
        schemas <- executeForSingleColumn("select distinct table_schem from system.jdbc.schemas")
        tables <- executeForSingleColumn("select distinct table_name from system.jdbc.tables")
        columns <- executeForSingleColumn("select distinct column_name from system.jdbc.columns")
      } yield Map("catalogs" -> catalogs, "schemas" -> schemas, "tables" -> tables, "columns" -> columns)
    }
  }

  override def chore(): Unit = {
    val startMillis = System.currentTimeMillis()

    val task = for {
      _ <- Task.eval(logger.info(s"event=db-refresh-chore-start"))

      newCatalogs <- Catalogs.get
      _ <- Task.eval {
        state.catalogs = RefreshableDb.mergeNewAndOldCatalogs(newCatalogs, state.catalogs)
      }

      autocomplete <- Autocomplete.get
      _ <- Task(state.autocomplete = autocomplete)

      _ <- Task.eval(logger.info(s"event=db-refresh-chore-finish millis=${System.currentTimeMillis() - startMillis}"))
    } yield ()

    task.runToFuture(io)
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