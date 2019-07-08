package quix.athena

import java.util.UUID

import monix.eval.Task
import quix.api.db._
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, Batch}
import quix.api.users.User
import quix.core.db.DbOps
import quix.core.results.SingleBuilder

import scala.concurrent.TimeoutException
import scala.concurrent.duration._

class AthenaDb(queryExecutor: AsyncQueryExecutor[String, Batch], config: AthenaConfig, state: AthenaDbState = new AthenaDbState) extends Db {

  val user = User("quix-athena-db-tree")

  override def catalogs: Task[List[Catalog]] = {
    if (state.schemas.nonEmpty || !state.shouldSyncSchemas) {
      Task.now(List(Catalog("awsdatacatalog", state.schemas)))
    } else {
      for {
        schemas <- Schemas.get
        _ <- Task {
          state.schemas = schemas
          state.lastSchemasSync = System.currentTimeMillis()
        }
      } yield List(Catalog("awsdatacatalog", schemas))
    }
  }

  override def autocomplete: Task[Map[String, List[String]]] = Task.now(Map.empty)

  override def table(catalog: String, schema: String, table: String): Task[Table] = {
    val sql = s"describe `$schema`.`$table`"
    val mapper: List[String] => Kolumn = {
      case List(nameAndType) =>
        nameAndType.split("\\s+") match {
          case Array(name, kind) => Kolumn(name, kind)
          case _ => Kolumn(nameAndType, "unknown")
        }
    }

    val task = for {columns <- executeFor(sql, mapper)}
      yield Table(table, columns.filter(_.name.trim.nonEmpty).filterNot(_.name.startsWith("# ")).distinct)

    val timeoutError = Task.raiseError(
      new TimeoutException(s"Failed to describe table in ${config.requestTimeout.millis.toSeconds} seconds"))

    task.timeoutTo(config.requestTimeout.millis, timeoutError)
  }

  def executeFor[T](sql: String, resultMapper: List[String] => T) = {
    val query = ActiveQuery(UUID.randomUUID().toString, Seq(sql), user)
    val resultBuilder = new SingleBuilder[String]
    for {
      _ <- queryExecutor.runTask(query, resultBuilder).timeout(config.requestTimeout.millis)
      results <- Task.eval(resultBuilder.build())
      mapped <- Task.eval(results.map(row => resultMapper(row.map(_.toString).toList)))
      failedIfEmpty <- if (resultBuilder.isFailure) {
        Task.raiseError(new Exception("query failed"))
      } else {
        Task.eval(mapped)
      }

    } yield failedIfEmpty
  }

  def executeForSingleColumn(sql: String, delim: String = "") = {
    executeFor[String](sql, x => x.mkString(delim))
  }

  object Schemas {
    def get: Task[List[Schema]] = {
      val task = for {
        schemaNames <- executeForSingleColumn("show databases")
        schemas <- Task.traverse(schemaNames)(inferSchemaInOneQuery)
      } yield schemas

      val timeoutError = Task.raiseError(
        new TimeoutException(s"Failed to build db tree in ${config.firstEmptyStateDelay.millis.toSeconds} seconds"))

      task.timeoutTo(config.firstEmptyStateDelay.millis, timeoutError)
    }

    def inferSchemaInOneQuery(schemaName: String): Task[Schema] = {
      val sql = s"show tables in `$schemaName`"

      for {
        tablesNames <- executeForSingleColumn(sql)
      } yield {
        val tables = tablesNames.map(table => Table(table, List()))
        Schema(schemaName, tables.sortBy(_.name))
      }
    }
  }

  override def search(query: String): Task[List[Catalog]] = {
    catalogs.map(catalogList => DbOps.search(catalogList, query))
  }
}

class AthenaDbState(var schemas: List[Schema] = Nil,
                    var autocomplete: Map[String, List[String]] = Map.empty,
                    var lastSchemasSync: Long = 0L,
                    var lastAutocompleteSync: Long = 0L) {

  def shouldSyncSchemas = schemas.isEmpty || lastSchemasSync + 5.minutes.toMillis < System.currentTimeMillis()

  def shouldSyncAutocomplete = autocomplete.isEmpty || lastAutocompleteSync + 5.minutes.toMillis < System.currentTimeMillis()
}
