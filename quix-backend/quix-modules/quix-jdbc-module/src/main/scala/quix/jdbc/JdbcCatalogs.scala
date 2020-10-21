package quix.jdbc

import java.sql.{Connection, DriverManager, ResultSet}

import monix.eval.Task
import quix.api.v1.db.{Catalog, Catalogs, Schema, Table}

import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._

class JdbcCatalogs(val config: JdbcConfig)
  extends Catalogs {

  override def fast: Task[List[Catalog]] = full

  def drainFullResultSet(rs: ResultSet) = Task {
    case class RichTable(catalog: String, schema: String, name: String)

    val tables = {
      val result = ListBuffer.empty[RichTable]

      while (rs.next()) {
        val catalog = rs.getString("TABLE_CAT")
        val schema = rs.getString("TABLE_SCHEM")
        val table = rs.getString("TABLE_NAME")

        config.url match {
          case url if url.startsWith("jdbc:mysql") =>
            result += RichTable("__root", catalog, table)

          case url if url.startsWith("jdbc:clickhouse") =>
            result += RichTable("__root", schema, table)

          case _ if catalog == null =>
            result += RichTable("__root", schema, table)

          case _ =>
            result += RichTable(catalog, schema, table)
        }
      }

      result.toList.distinct
    }

    val catalogs = for ((catalogName, catalogTables) <- tables.groupBy(_.catalog).toList)
      yield {
        val schemas = for ((schemaName, schemaTables) <- catalogTables.groupBy(_.schema).toList)
          yield Schema(schemaName, schemaTables.map(tbl => Table(tbl.name, Nil)))

        Catalog(catalogName, schemas)
      }

    catalogs
  }

  override def full: Task[List[Catalog]] = {
    val connect: Task[Connection] = {
      for {
        connection <- Task(
          DriverManager.getConnection(config.url, config.user, config.pass)
        ).timeout(config.connectTimeout.millis)
      } yield connection
    }

    val close = (connection: Connection) =>
      for (_ <- Task(connection.close()).attempt) yield ()


    val use = (con: Connection) => {
      for {
        metadata <- Task(con.getMetaData)
        resultSet <- Task(metadata.getTables(null, null, "%", null))
        catalogs <- drainFullResultSet(resultSet)
      } yield catalogs
    }

    connect
      .bracket(use)(close)
  }
}
