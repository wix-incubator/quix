package quix.core.history.dao
import java.sql.{Connection, DriverManager, PreparedStatement, ResultSet}
import java.time.{Clock, Instant}

import cats.effect.Resource
import cats.syntax.apply._
import monix.eval.Task
import quix.api.v2.execute.{Query => ActiveQuery}
import quix.api.v1.users.User
import quix.core.history.dao.MySqlHistoryDao._
import quix.core.history.{Execution, ExecutionStatus}

class MySqlHistoryReadDao(connection: Connection) extends HistoryReadDao {

  override def executions(filter: Filter, sort: Sort, page: Page): Task[List[Execution]] = {
    val insertStatement = prepare(connection) {
      s"""
        SELECT id, query_type, statements, user_id, user_email, created_at, status
        FROM executions_history
        WHERE ${where(filter)}
        ${orderBy(sort)}
        LIMIT ?, ?
      """
    }

    insertStatement.use { statement =>
      for {
        _ <- Task(statement.setInt(1, page.offset))
        _ <- Task(statement.setInt(2, page.limit))
        rows <- Task(statement.executeQuery()).bracket(getRows(getExecution))(rs => Task(rs.close()))
      } yield rows.reverse
    }
  }

  private def where(filter: Filter): String = filter match {
    case Filter.Status(status) => s"status = '${status.toString.toUpperCase}'"
    case Filter.User(userEmail) => s"user_email = '$userEmail'"
    case Filter.Query(query) => s"statements like '%$query%'"
    case Filter.CompoundFilter(filters) => filters.map(where).mkString(" and ")
    case Filter.None => "1 = 1"
  }

  private def orderBy(sort: Sort): String =
    s"ORDER BY ${field(sort.by)} ${order(sort.order)}"

  private def field(sortField: SortField): String = sortField match {
    case SortField.StartTime => "created_at"
  }

  private def order(sortOrder: SortOrder): String = sortOrder match {
    case SortOrder.Descending => "DESC"
    case SortOrder.Ascending => "ASC"
  }

  private def getRows[A](getRow: ResultSet => Task[A])(resultSet: ResultSet): Task[List[A]] = {
    Task(resultSet.next()).flatMapLoop(List.empty[A]) { (hasRow, rows, continue) =>
      if (hasRow) getRow(resultSet).flatMap(row => continue(row :: rows))
      else Task.now(rows)
    }
  }

  private def getExecution(resultSet: ResultSet): Task[Execution] = for {
    id <- Task(resultSet.getString("id"))
    queryType <- Task(resultSet.getString("query_type"))
    statements <- Task(resultSet.getString("statements"))
    userEmail <- Task(resultSet.getString("user_email"))
    userId <- Task(resultSet.getString("user_id"))
    createdAt <- Task(resultSet.getLong("created_at"))
    status <- Task(resultSet.getString("status"))
  } yield Execution(
    id = id,
    queryType = queryType,
    statements = statements.split(separator),
    user = User(userEmail, userId),
    startedAt = Instant.ofEpochMilli(createdAt),
    status = statusFrom(status))

  private def statusFrom(status: String): ExecutionStatus = status match {
    case "RUNNING" => ExecutionStatus.Running
    case "FINISHED" => ExecutionStatus.Finished
    case _ => ExecutionStatus.Failed
  }

}

class MySqlHistoryWriteDao(connection: Connection, clock: Clock) extends HistoryWriteDao {

  private val instant = Task(clock.instant())

  private val startStatement = prepare(connection) {
    """
      INSERT INTO executions_history (id, query_type, statements, user_id, user_email, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    """
  }

  private val succeedStatement = prepare(connection) {
    "UPDATE executions_history SET status = 'FINISHED' WHERE id = ? LIMIT 1"
  }

  private val failStatement = prepare(connection) {
    "UPDATE executions_history SET status = 'FAILED' WHERE id = ? LIMIT 1"
  }

  override def executionStarted(query: ActiveQuery, queryType: String): Task[Unit] =
    startStatement.use { statement =>
      for {
        now <- instant
        _ <- Task(statement.setString(1, query.id))
        _ <- Task(statement.setString(2, queryType))
        // TODO - this is not a good way to save multiple statements, better use a JSON list
        _ <- Task(statement.setString(3, query.subQueries.map(_.text).mkString(separator)))
        _ <- Task(statement.setString(4, query.subQueries.map(_.user).head.id))
        _ <- Task(statement.setString(5, query.subQueries.map(_.user).head.email))
        _ <- Task(statement.setLong(6, now.toEpochMilli))
        _ <- Task(statement.executeUpdate())
      } yield ()
    }

  override def executionSucceeded(queryId: String): Task[Unit] =
    succeedStatement.use { statement =>
      Task(statement.setString(1, queryId)) *>
        Task(statement.executeUpdate())
    }

  override def executionFailed(queryId: String, error: Throwable): Task[Unit] =
    failStatement.use { statement =>
      Task(statement.setString(1, queryId)) *>
        Task(statement.executeUpdate())
    }

}

case class JdbcConfig(url: String, user: String, pass: String)

object MySqlHistoryDao {
  val separator = ";"

  def connect(config: JdbcConfig): Resource[Task, Connection] = {
    val acquire = Task(DriverManager.getConnection(config.url, config.user, config.pass))
    Resource.make(acquire)(connection => Task(connection.close()))
  }

  def prepare(connection: Connection)(sql: String): Resource[Task, PreparedStatement] =
    Resource.make(Task(connection.prepareStatement(sql)))(statement => Task(statement.close()))
}
