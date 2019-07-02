package quix.core.sql

import io.prestosql.sql.parser.StatementSplitter

import scala.collection.JavaConverters._

object PrestoSqlOps {

  def splitToStatements(multipleStatements: String): List[String] = {
    val splitter = new StatementSplitter(multipleStatements, Set(";").asJava)

    val completeStatements = splitter.getCompleteStatements.asScala.map(_.statement()).toList
    val partialStatements = List(splitter.getPartialStatement).filterNot(_.trim.isEmpty)

    completeStatements ++ partialStatements
  }
}
