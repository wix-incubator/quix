package quix.core.utils

import com.typesafe.scalalogging.LazyLogging
import monix.eval.Task
import quix.api.v2.execute.{Builder, Executor, SubQuery}

import scala.collection.mutable.ListBuffer

class TestExecutor extends Executor with LazyLogging {

  val executedQueries = ListBuffer.empty[SubQuery]
  var executionToFailOn = -1

  def queries: List[String] = executedQueries.map(_.text).toList

  override def execute(query: SubQuery, builder: Builder): Task[Unit] = {
    val result = Task(executedQueries.length == executionToFailOn).flatMap {
      case true =>
        builder.errorSubQuery(query.id, new RuntimeException(s"execution $executionToFailOn should fail")) *> Task.unit
      case _ => Task.unit
    }

    Task(logger.info(s"query : ${query.text}")) *> Task(executedQueries += query) *> result
  }

  def failOnExecutionNumber(executionToFailOn: Int): Unit =
    this.executionToFailOn = executionToFailOn
}
