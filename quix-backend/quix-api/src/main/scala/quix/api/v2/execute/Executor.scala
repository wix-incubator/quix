package quix.api.v2.execute

import monix.eval.Task

/** Used to execute single query and stream the results back to Builder */
trait Executor {
  def execute(query: SubQuery, builder: Builder): Task[Unit]
}
