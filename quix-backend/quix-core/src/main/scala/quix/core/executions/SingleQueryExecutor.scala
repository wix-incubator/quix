package quix.core.executions

import java.util.UUID

import monix.eval.Task
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, Batch}
import quix.api.users.User
import quix.core.results.SingleBuilder

trait SingleQueryExecutor {
  val queryExecutor: AsyncQueryExecutor[String, Batch]

  val user = User("quix-db-tree")

  def executeForSingleColumn(sql: String, delim: String = "") = {
    executeFor[String](sql, x => x.mkString(delim))
  }

  def executeFor[T](sql: String, resultMapper: List[String] => T) = {
    val query = ActiveQuery(UUID.randomUUID().toString, Seq(sql), user)
    val resultBuilder = new SingleBuilder[String]
    for {
      _ <- queryExecutor.runTask(query, resultBuilder)
      results <- Task.eval(resultBuilder.build())
      mapped <- Task.eval(results.map(row => resultMapper(row.map(_.toString).toList)))
      failedIfEmpty <- if (resultBuilder.isFailure) {
        Task.raiseError(new Exception("query failed"))
      } else {
        Task.eval(mapped)
      }

    } yield failedIfEmpty
  }
}