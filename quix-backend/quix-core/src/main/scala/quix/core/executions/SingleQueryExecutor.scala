package quix.core.executions

import java.util.UUID

import monix.eval.Task
import quix.api.execute.{ActiveQuery, AsyncQueryExecutor, Batch}
import quix.api.users.User
import quix.core.results.SingleBuilder

/** SingleQueryExecutor exposes useful methods for executing single queries with small amount of rows */
trait SingleQueryExecutor {
  val queryExecutor: AsyncQueryExecutor[String, Batch]

  val user = User("quix-db-tree")

  /** @param sql  sql that when executed will return small amount of results
   * @param delim delimiter that will be used to concatenate each row produced by sql
   * @return list of rows, if row is made of more than one column, they will be concatenated with delim
   * */
  def executeForSingleColumn(sql: String, delim: String = ""): Task[List[String]] = {
    executeFor[String](sql, x => x.mkString(delim))
  }

  /** @param sql         Sql that when executed will return small amount of results
   * @param resultMapper Function that will be applied to each row
   * @return Returns list of T produced by applying resultMapper on each row
   */
  def executeFor[T](sql: String, resultMapper: List[String] => T): Task[List[T]] = {
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