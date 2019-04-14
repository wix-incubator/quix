package quix.presto

import com.typesafe.scalalogging.LazyLogging
import io.prestosql.sql.parser.StatementSplitter
import monix.eval.Task
import quix.api.execute._
import quix.api.module.ExecutionModule
import quix.presto.rest.PrestoSql

import scala.collection.JavaConverters._

case class PrestoConfig(statementsApi: String, healthApi: String, queryInfoApi: String, schema: String, catalog: String, source: String)

class PrestoQuixModule(val prestoExecutions: PrestoExecutions) extends ExecutionModule[String, PrestoEvent] with LazyLogging {
  override def name: String = "presto"

  override def start(command: StartCommand[String], consumer: Consumer[PrestoEvent]): Task[Unit] = {
    logger.info(s"event=start-command consumer-id=${consumer.id} user=${consumer.user.email}")

    val sqls = for {
      statement <- PlainPrestoSqlSupport.splitToStatements(command.code)
    } yield PlainPrestoSqlSupport.getSessionProperties(statement)

    prestoExecutions
      .execute(sqls, consumer.user, new MultiResultBuilder(consumer))
      .doOnCancel(prestoExecutions.kill(consumer.id, consumer.user))
  }

}

object PlainPrestoSqlSupport {
  val SET_SESSION_PATTERN = "(?i)set\\s*session\\s+(.*)"
  val SET_SESSION = SET_SESSION_PATTERN.r
  val KEYANDVALUE = "(.*?)=(.*?);".r

  def getSessionProperties(text: String): PrestoSql = {
    def split(line: String): Option[(String, String)] = {
      line match {
        case SET_SESSION(keyAndValue) =>

          keyAndValue match {
            case KEYANDVALUE(keyPart, valuePart) =>
              val key = keyPart.trim
              val value = {
                val trimmed = valuePart.trim
                if (trimmed.startsWith("\'") && trimmed.endsWith("\'")) {
                  trimmed.substring(1, trimmed.length - 1)
                } else trimmed
              }
              Option(key -> value)
            case _ => throw new InvalidSessionProperty(line)
          }
        case _ => throw new InvalidSessionProperty(line)
      }
    }

    val lines: Array[String] = text.split("\n").map(_.trim)

    val (sessionLines, queryLines) = lines.partition(_.matches(SET_SESSION_PATTERN))

    val sessions = sessionLines.flatMap(split).toMap

    val query = queryLines.mkString("\n")

    PrestoSqlWithSession(query, sessions)
  }

  def splitToStatements(multipleStatements: String) = {
    val splitter = new StatementSplitter(multipleStatements, Set(";").asJava)

    splitter.getCompleteStatements.asScala.map(_.statement()).toList ++ List(splitter.getPartialStatement).filterNot(_.isEmpty)
  }
}

case class PrestoSqlWithSession(text: String, session: Map[String, String] = Map.empty) extends PrestoSql

class InvalidSessionProperty(property: String) extends RuntimeException(s"invalid session property $property")