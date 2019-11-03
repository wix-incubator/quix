package quix.jdbc

import java.sql.{Connection, DriverManager, ResultSet}

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.execute._
import quix.core.utils.TaskOps._

import scala.collection.mutable.ListBuffer
import scala.concurrent.duration._

case class JdbcConfig(url: String,
                      user: String,
                      pass: String,
                      driver: String,
                      connectTimeout: Long = 1000 * 10,
                      batchSize: Int = 2000)

class JdbcQueryExecutor(config: JdbcConfig)
  extends AsyncQueryExecutor[String, Batch]
    with LazyLogging {

  def prepareBatch(query: ActiveQuery[String], rs: ResultSet): Task[Batch] =
    Task {
      val rows = ListBuffer.empty[Seq[Any]]
      val columnCount = rs.getMetaData.getColumnCount

      val columns = for (i <- 1 to columnCount)
        yield BatchColumn(rs.getMetaData.getColumnName(i))

      do {
        val row = for (i <- 1 to columnCount)
          yield {
            rs.getMetaData.getColumnType(i) match {
              case java.sql.Types.ARRAY if rs.getArray(i) != null =>
                rs.getArray(i).getArray

              case _ => rs.getObject(i)
            }
          }

        rows += row
      } while (!query.isCancelled && rows.size < config.batchSize && rs.next())

      Batch(rows, Some(columns))
    }

  def drainResultSet(query: ActiveQuery[String],
                     rb: Builder[String, Batch],
                     rs: ResultSet): Task[Unit] = {
    if (rs != null && !query.isCancelled && rs.next()) {
      for {
        batch <- prepareBatch(query, rs)
        _ <- rb.addSubQuery(query.id + query.current, batch)
        _ <- drainResultSet(query, rb, rs)
      } yield ()
    } else {
      Task.unit
    }
  }

  def runTask(query: ActiveQuery[String],
              builder: Builder[String, Batch]): Task[Unit] = {

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
        _ <- builder.startSubQuery(query.id + query.current, query.text, Batch(Nil))
        statement <- Task(con.createStatement())
        _ <- Task(statement.execute(query.text))
        _ <- drainResultSet(query, builder, statement.getResultSet)
        _ <- builder.endSubQuery(query.id + query.current)
      } yield ()
    }

    connect
      .bracket(use)(close)
      .logOnError(s"method=runTask event=error query-id=${query.id}")
      .onErrorHandleWith { e =>
        builder.errorSubQuery(query.id, e)
      }
  }
}
