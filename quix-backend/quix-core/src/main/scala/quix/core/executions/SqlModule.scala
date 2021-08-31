package quix.core.executions

import monix.eval.Task
import monix.execution.atomic.Atomic
import quix.api.v1.db.Db
import quix.api.v1.execute.StartCommand
import quix.api.v1.users.User
import quix.api.v2.execute._
import quix.core.sql.{PrestoLikeSplitter, SqlSplitter}

import java.time.format.DateTimeFormatter
import java.time.{Duration, Instant, ZoneId}

class SqlModule(val executor: Executor,
                val db: Option[Db],
                val splitter: SqlSplitter = PrestoLikeSplitter) extends ExecutionModule {

  def getSubQueries(command: StartCommand[String], id: String, user: User, startTime: Instant, stopTime: Instant, interval: Duration): List[Seq[SubQuery]] = {
    val intervals = List.range(startTime.toEpochMilli, stopTime.toEpochMilli, interval.toMillis)
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.of("UTC"))

    val queries = intervals
      .map { startTime =>
        val params = Map(
          "$START_TIME" -> formatter.format(Instant.ofEpochMilli(startTime)),
          "$STOP_TIME" -> formatter.format(Instant.ofEpochMilli(startTime + interval.toMillis))
        )

        splitter.split(command, id, user).subQueries.map(query => SubQueryWithParameters(query, params))
      }

    queries
  }

  override def start(command: StartCommand[String], id: String, user: User, builder: Builder): Task[Unit] = {
    val query = splitter.split(command, id, user)

    val execution = if (shouldBeExecutedInLoop(command))
      createLoopedExecution(builder, query, command, id, user)
    else createExecution(builder, query.subQueries)

    execute(query, execution, builder)
  }

  private def shouldBeExecutedInLoop(command: StartCommand[String]) = {
    val keys = command.session.keySet

    keys.contains("loop.interval") &&
      keys.contains("loop.startTime") &&
      keys.contains("loop.stopTime")
  }

  private def createExecution(builder: Builder, subQueries: Seq[SubQuery]) = {
    Task.traverse(subQueries) { q =>
      Task(builder.lastError).flatMap {
        case None =>
          executor.execute(q, builder)
        case Some(e) =>
          Task.raiseError(e)
      }
    }
  }

  private def createLoopedExecution(builder: Builder, query: Query, command: StartCommand[String], id: String, user: User) = {
    val subQueriesTask = for {
      startLoop <- Task(command
        .session.get("loop.startTime")
        .map(Instant.parse)
        .getOrElse(throw new IllegalArgumentException("missing loop.startTime")))

      endLoop <- Task(command
        .session.get("loop.stopTime")
        .map(Instant.parse)
        .getOrElse(throw new IllegalArgumentException("missing loop.stopTime")))

      interval <- Task(command
        .session.get("loop.interval")
        .map(Duration.parse)
        .getOrElse(throw new IllegalArgumentException("missing loop.interval")))

      subQueries = getSubQueries(command, id, user, startLoop, endLoop, interval)
    } yield subQueries

    subQueriesTask.flatMap { subQueries =>
      Task.traverse(subQueries.zipWithIndex) { case (queries, index) =>

        val params = queries.headOption.collect {
          case query: SubQueryWithParameters => query.params
        }.getOrElse(Map.empty).toList.sorted
          .map(pair => s""""${pair._1}" : "${pair._2}"""")
          .mkString("[", ",", "]")

        val logOnStart = builder.log(query.id, s"Started iteration ${index + 1} out of ${subQueries.size} with params $params")
        val logOnEnd = builder.log(query.id, s"Finished iteration ${index + 1} out of ${subQueries.size} with params $params")

        logOnStart *> createExecution(builder, queries) *> logOnEnd *> Task.unit
      }
    } *> Task.unit
  }

  def execute(query: Query, mainTaskToExecute: Task[Any], builder: Builder): Task[Unit] = {
    for {
      _ <- builder.start(query)
      _ <- mainTaskToExecute
      _ <- builder.end(query)
    } yield ()
  }
}

case class SubQueryWithParameters(original: SubQuery, params: Map[String, String]) extends SubQuery {

  override def text: String = {
    params.foldLeft(original.text) {
      case (text, (param, replacement)) =>
        text.replace(param, replacement)
    }
  }

  override def id: String = original.id

  override def session: Session = original.session

  override def user: User = original.user

  override def canceled: Atomic[Boolean] = original.canceled
}
