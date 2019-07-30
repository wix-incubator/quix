package quix.presto.db

import monix.eval.Task
import quix.api.db.{Catalog, Catalogs, Schema, Table}
import quix.api.execute.{AsyncQueryExecutor, Batch}
import quix.core.executions.SingleQueryExecutor

class PrestoCatalogs(val queryExecutor: AsyncQueryExecutor[String, Batch])
  extends Catalogs with SingleQueryExecutor {

  override def fast: Task[List[Catalog]] = getCatalogNamesOnly

  override def full: Task[List[Catalog]] =
    inferCatalogsInSingleQuery
      .onErrorFallbackTo(inferCatalogsOneByOne)
      .onErrorFallbackTo(Task.now(Nil))

  case class RichTable(catalog: String, schema: String, name: String)

  private def inferCatalogsOneByOne = {
    for {
      catalogNames <- executeForSingleColumn("show catalogs")
      catalogs <- Task.traverse(catalogNames)(inferSchemaOfCatalog)
    } yield catalogs
  }

  def getCatalogNamesOnly = {
    for {
      catalogNames <- executeForSingleColumn("show catalogs")
        .onErrorFallbackTo(Task.now(Nil))
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
    val slowFallbackOne = inferSchemaOneByOne(catalogName)
    val slowFallbackTwo = inferSchemaViaShowSchemas(catalogName)
    val emptyCatalog = Task.now(Catalog(catalogName, List.empty))

    fastQueryInference
      .onErrorFallbackTo(slowFallbackOne)
      .onErrorFallbackTo(slowFallbackTwo)
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

  def inferSchemaViaShowSchemas(catalogName: String): Task[Catalog] = {
    val sql = s"show schemas from $catalogName"

    for {
      schemaNames <- executeForSingleColumn(sql)
      schemas <- Task.traverse(schemaNames)(schema => inferTablesViaShowTables(catalogName, schema).map(tables => Schema(schema, tables)))
    } yield Catalog(catalogName, schemas)
  }

  def inferTablesViaShowTables(catalogName: String, schemaName: String): Task[List[Table]] = {
    val sql = s"show tables from $catalogName.$schemaName"

    val task = for {
      tables <- executeForSingleColumn(sql)
    } yield {
      tables.sorted.map(name => Table(name, List.empty))
    }

    task.onErrorFallbackTo(Task.eval(List.empty))
  }
}