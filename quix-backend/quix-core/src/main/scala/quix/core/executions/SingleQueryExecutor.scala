package quix.core.executions

import monix.eval.Task
import quix.api.v1.users.User
import quix.api.v2.execute.{Executor, ImmutableSubQuery}
import quix.core.results.SingleBuilder

/** SingleQueryExecutor exposes useful methods for executing single queries with small amount of rows */
trait SingleQueryExecutor {
  val queryExecutor: Executor

  val user = User("quix-db-tree")

  /** @param sql  sql that when executed will return small amount of results
   * @param delim delimiter that will be used to concatenate each row produced by sql
   * @return list of rows, if row is made of more than one column, they will be concatenated with delim
   **/
  def executeForSingleColumn(sql: String, delim: String = ""): Task[List[String]] = {
    executeFor[String](sql, x => x.mkString(delim))
  }

  /** @param sql         Sql that when executed will return small amount of results
   * @param resultMapper Function that will be applied to each row
   * @return Returns list of T produced by applying resultMapper on each row
   */
  def executeFor[T](sql: String, resultMapper: List[String] => T): Task[List[T]] = {
    val subQuery = ImmutableSubQuery(sql, user)
    val resultBuilder = new SingleBuilder
    for {
      _ <- queryExecutor.execute(subQuery, resultBuilder)
      results <- Task(
        resultBuilder.build()
          .map(row => resultMapper(row.map(_.toString).toList))
      )
      _ <- if (resultBuilder.isFailure) {
        Task.raiseError(new Exception("query failed"))
      } else {
        Task.unit
      }

    } yield results
  }
}