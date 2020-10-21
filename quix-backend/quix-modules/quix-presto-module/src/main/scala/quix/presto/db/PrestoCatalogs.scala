package quix.presto.db

import monix.eval.Task
import quix.api.v1.db.{Catalog, Catalogs, Schema, Table}
import quix.api.v2.execute.Executor
import quix.core.executions.SingleQueryExecutor

class PrestoCatalogs(val queryExecutor: Executor)
  extends Catalogs with SingleQueryExecutor {

  override def fast: Task[List[Catalog]] = getCatalogNamesOnly

  override def full: Task[List[Catalog]] =
    inferCatalogsOneByOne
      .onErrorFallbackTo(getCatalogNamesOnly)
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
      s"""select distinct catalog, schema, tbl from (
         |    select distinct table_cat as catalog, table_schem as schema, table_name as tbl
         |    from system.jdbc.tables
         |    where table_cat = '$catalogName'
         |    and table_schem != 'information_schema'
         |
         |    union all
         |
         |    select distinct table_catalog as catalog, table_schema as schema, table_name as tbl
         |    from $catalogName.information_schema.tables
         |    where table_schema not in ('information_schema')
         |)
         |""".stripMargin

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
      s"""
         |select distinct table_schema from (
         |    select distinct table_schem as table_schema
         |    from system.jdbc.tables
         |    where table_cat = '$catalogName'
         |    and table_schem != 'information_schema'
         |
         |    union all
         |
         |    select distinct table_schema as table_schema
         |    from $catalogName.information_schema.tables
         |    where table_schema not in ('information_schema')
         |
         |    union all
         |
         |    select distinct table_schem as table_schema
         |    from system.jdbc.schemas
         |    where table_catalog = '$catalogName' and table_schem not in ('information_schema')
         |) order by 1;
         |
         |""".stripMargin

    for {
      schemaNames <- executeForSingleColumn(sql)
      schemas <- Task.traverse(schemaNames)(schema => inferTablesViaShowTables(catalogName, schema).map(tables => Schema(schema, tables)))
    } yield Catalog(catalogName, schemas)
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

    for {
      tables <- executeForSingleColumn(sql)
    } yield {
      tables.sorted.map(name => Table(name, List.empty))
    }
  }
}