package quix.core.sql

import monix.execution.atomic.Atomic
import quix.api.v1.execute.StartCommand
import quix.api.v1.users.User
import quix.api.v2.execute.{ImmutableSubQuery, MutableSession, Query, Session}

trait SqlSplitter {
  def split(sql: String): List[String]

  def newSession(command: StartCommand[String], user: User): Session = new MutableSession

  def split(command: StartCommand[String], id: String, user: User): Query = {
    val canceled = Atomic(false)
    val session = newSession(command, user)

    val subQueries = split(command.code).map { sql =>
      ImmutableSubQuery(sql, user, canceled = canceled, session = session)
    }

    Query(subQueries, id, canceled)
  }
}

object PrestoLikeSplitter extends SqlSplitter {
  def split(sql: String): List[String] = {
    PrestoSqlOps.splitToStatements(sql)
  }
}

class StopWordSqlSplitter(val stopWords: String*) extends SqlSplitter {
  def split(sql: String): List[String] = {
    val statements = PrestoSqlOps.splitToStatements(sql)

    val noStopWords = statements.dropWhile(containsStopWords)

    val maybeSplitByStopWords = noStopWords.headOption.map { statement =>
      val newHead = sql.substring(0, sql.indexOf(statement) + statement.length)
      newHead :: noStopWords.tail
    }

    maybeSplitByStopWords.getOrElse(statements)
  }

  def containsStopWords(sql: String): Boolean = {
    stopWords.exists(sql.contains)
  }
}