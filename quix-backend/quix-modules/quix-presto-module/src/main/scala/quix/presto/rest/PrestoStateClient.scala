package quix.presto.rest

import monix.eval.Task
import quix.api.execute.ActiveQuery

trait PrestoStateClient {

  def init(query: ActiveQuery[String]): Task[PrestoState]

  def advance(uri: String): Task[PrestoState]

  def close(state: PrestoState): Task[Unit]

  def info(state: PrestoState): Task[PrestoQueryInfo]

  def health(): Task[PrestoHealth]
}
