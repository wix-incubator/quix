package quix.core.sql

trait SqlSplitter {
  def split(sql: String): List[String]
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