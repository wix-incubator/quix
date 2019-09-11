package quix.core.sql

import io.prestosql.sql.parser.StatementSplitter

import scala.collection.JavaConverters._

object PrestoSqlOps {

  def splitToStatements(multipleStatements: String): List[String] = {
    val splitter = new StatementSplitter(multipleStatements, Set(";").asJava)

    val completeStatements = splitter.getCompleteStatements.asScala.map(_.statement()).toList
    val partialStatements = splitter.getPartialStatement

    val restIsEmptyOrMadeofComments = partialStatements.trim.isEmpty || partialStatements.split("\n").filterNot(_.isEmpty).forall(_.trim.startsWith("--"))

    (completeStatements.isEmpty, restIsEmptyOrMadeofComments) match {
      case (true, true) =>
        List.empty

      case (true, _) =>
        List(multipleStatements)

      case (false, true) =>
        recoverLeadingSpaces(multipleStatements, completeStatements.head) +: completeStatements.tail

      case (false, false) =>
        recoverLeadingSpaces(multipleStatements, completeStatements.head) +: completeStatements.tail :+ partialStatements
    }
  }

  /*
    StatementSplitter trims all leading whitespaces, which makes it hard
    to mark correct line in case of presto error

    see https://github.com/wix/quix/issues/58 for more details
   */
  def recoverLeadingSpaces(original: String, trimmed: String): String = {
    val index = original.indexOf(trimmed)
    original.substring(0, index) ++ trimmed
  }
}
