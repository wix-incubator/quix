package quix.jdbc

import java.sql.{Connection, DatabaseMetaData, DriverManager, ResultSet}

import monix.eval.Task
import quix.api.v1.db.{Kolumn, Table, Tables}

import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._

class JdbcTables(val config: JdbcConfig) extends Tables {

  override def get(catalog: String, schema: String, table: String): Task[Table] = {
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
        resultSet <- fetchColumns(catalog, schema, table, metadata)
        columns <- drainResultSet(resultSet)
      } yield Table(table, columns)
    }

    connect
      .bracket(use)(close)
  }

  private def fetchColumns(catalog: String, schema: String, table: String, metadata: DatabaseMetaData) = {
    // https://bugs.mysql.com/bug.php?id=23304
    // due to mysql jdbc/odbc driver legacy implementation .getCatalogs returns list of schemas
    // and .getSchemas returns empty list

    if (config.url.startsWith("jdbc:mysql"))
      Task(metadata.getColumns(schema, null, table, null))
    else Task(metadata.getColumns(catalog, schema, table, null))
  }

  def drainResultSet(rs: ResultSet): Task[List[Kolumn]] = Task {
    val columns = ListBuffer.empty[Kolumn]

    while (rs.next()) {
      val name = rs.getString("COLUMN_NAME")
      val datatype = rs.getString("TYPE_NAME")
      columns += Kolumn(name, datatype)
    }

    columns.toList
  }
}
